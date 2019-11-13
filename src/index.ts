import {AxiosInstance, AxiosRequestConfig, AxiosTransformer} from 'axios'
import {
  AxiosErrorEx,
  AxiosRequestConfigEx,
  InterceptorIds,
  MargeResponse,
  Matcher,
  Method,
  StatusKeyFunction,
  TransformerResponse,
  TransFormerStatus,
  TransformSet,
  TransformSetArray,
  TransformsOptions,
} from './types'
import {
  getMatchedMatchers,
  margeMatcher,
  mergeArrays,
  transFormError,
  transFormRequest,
  onlyArray,
} from './utils'

export * from './types'
export * from './utils'

function _createCacheKey(url: string, method: string): string {
  return `${method}>${url}`
}

export class StatusMapper<K extends object, S> {

  private readonly _statusMap: WeakMap<K, S> = new WeakMap()
  private readonly _creator: () => K

  constructor(creator: (() => K)) {
    this._creator = creator
  }

  getStatus(key: K): S | undefined {
    return this._statusMap.get(key)
  }

  saveStatus(key: K, value: S) {
    this._statusMap.set(key, value)
  }

  createStatus(value: S): K {
    const key = this._creator()
    this._statusMap.set(key, value)
    return key
  }

  getStatusInMany(keys: any[] | any) {
    if(Array.isArray(keys)) {
     for(const key of keys) {
       const value = this.getStatus(key)
       if(value) {
         return {key, value}
       }
     }
     return {key: undefined, value: undefined}
    }
    const value = this._statusMap.get(keys)
    if(value) {
      return {key: keys, value}
    }
    return  {key: undefined, value: undefined}
  }
}

export default class Transforms<C = any> {

  private readonly _options: TransformsOptions
  private _interceptorId: InterceptorIds | null = null
  private readonly _cache: Map<string, TransformSetArray<C>> = new Map()
  private readonly _statusMap: StatusMapper<StatusKeyFunction, TransFormerStatus>
    = new StatusMapper<StatusKeyFunction, TransFormerStatus>(() => (data) => (data))

  get first(): TransformSet<C> | undefined {
    return this._options.first
  }

  get final(): TransformSet<C> | undefined {
    return this._options.final
  }

  get context(): C {
    const {context = () => ({})} = this._options
    return context()
  }

  get matchers(): Matcher[] {
    const {matchers = []} = this._options
    return matchers
  }

  get margeResponse(): MargeResponse | undefined {
    const {margeResponse} = this._options
    return margeResponse
  }

  constructor(options: TransformsOptions = {}) {
    this._options = {...options}
  }

  /**
   * Eject transform
   * @param axios
   */
  ejectTransform(axios: AxiosInstance): boolean {
    if(!this._interceptorId) {
      return false
    }
    axios.interceptors.request.eject(this._interceptorId.request)
    axios.interceptors.response.eject(this._interceptorId.response)
    this._interceptorId = null
    return true
  }

  /**
   * Apply transform
   * @param axios
   */
  applyTransform(axios: AxiosInstance): InterceptorIds {
    if(this._interceptorId) {
      return this._interceptorId
    }

    // request & response transform
    const requestId = axios.interceptors
    .request.use(this._requestInterceptors())

    // error transform
    const responseId = axios.interceptors
    .response.use(
      (res) => (res),
      this._errorInterceptors(axios),
    )

    this._interceptorId = {
      request: requestId,
      response: responseId,
    }
    return this._interceptorId
  }

  /**
   * Add Interceptors for response & request transforms
   * @deprecated
   */
  addInterceptors(
    axios: AxiosInstance,
  ) {
    this.applyTransform(axios)
    return axios
  }

  /**
   * Return AxiosTransformer form response
   * @param config
   * @private
   */
  private _getResponseTransforms(config: AxiosRequestConfig):
    AxiosTransformer[] {
    const {margeResponse, context} = this
    const {url, method} = config
    const transformSet = this._getTransformSet(url, method)
    // response
    const responseTransforms:
      Array<TransformerResponse<C> |
        Array<TransformerResponse<C>> | undefined> = []
    if(margeResponse === 'front') {
      responseTransforms.push(transformSet.response, config.transformResponse)
    } else if(margeResponse === 'back') {
      responseTransforms.push(config.transformResponse, transformSet.response)
    } else {
      responseTransforms.push(transformSet.response)
    }
    const transformResponse = mergeArrays<TransformerResponse<C>>(responseTransforms)
    return transformResponse.map(
      (transform) => (data) => (transform(data, context, config)),
    )
  }

  /**
   * Return error interceptor
   * @param axios axios instance
   * @private
   */
  private _errorInterceptors(axios: AxiosInstance):
    ((error: AxiosErrorEx) => Promise<AxiosErrorEx | any>) {
    return async (error: AxiosErrorEx) => {
      const {config} = error
      if(!config) {
        throw error
      }

      const {key, value: status = {}} = this._statusMap.getStatusInMany(config.transformRequest)
      config.transformResponse = []
      config.transformRequest = []
      config.transformRequest.push(key)

      const {originalConfig = config} = status

      if(originalConfig) {
        config.url = originalConfig.url
        config.method = originalConfig.method
        config.params = {...originalConfig.params}
        config.data = {...originalConfig.data}
        config.headers = {...originalConfig.headers}
      }

      const {url, method} = originalConfig
      const transformSet = this._getTransformSet(url, method)
      error.isError = true
      const _error: AxiosErrorEx = await transFormError<C>(
        transformSet.error, error, this.context, status)
      if(_error.retry) {
        return Promise.resolve().then(() => {
          return axios.request(_error.config)
        })
      }
      // @ts-ignore
      return Promise.reject(_error)
    }
  }

  /**
   * Return request interceptor
   * @private
   */
  private _requestInterceptors():
    ((config: AxiosRequestConfigEx) => Promise<AxiosRequestConfigEx>) {
    return async (config: AxiosRequestConfigEx) => {
      const {context} = this
      const {url, method} = config
      const {key, value: status = {
        originalConfig: {...config},
      }} = this._statusMap.getStatusInMany(config.transformRequest)
      const saveStatusKey = key || this._statusMap.createStatus(status)
      config.transformRequest = onlyArray(config.transformRequest)
      config.transformRequest.push(saveStatusKey)

      // get transform
      const transformSet = this._getTransformSet(url, method)
      // request
      const newConfig = await transFormRequest(
        transformSet.request,
        {...config},
        context,
      )

      // response
      newConfig.transformResponse = this._getResponseTransforms({...config})
      return newConfig
    }
  }

  /**
   * Manage match cache
   * @param url
   * @param method
   * @param save
   * @private
   */
  private _saveCache(
    url: string,
    method: string,
    save: (() => TransformSetArray<C>)): TransformSetArray<C> {
    const key = _createCacheKey(url, method)
    const value = this._cache.get(key)
    if(!value) {
      const value = save()
      this._cache.set(key, value)
      return value
    }
    return value
  }

  /**
   * Find matched transforms
   */
  private _getTransformSet(
    url: string = '/',
    method: Method = 'all',
  ): TransformSetArray<C> {
    return this._saveCache(url, method, () => {
      const {matchers, final, first} = this
      const matchedTransforms: Array<TransformSet<C>> = getMatchedMatchers(matchers, url, method)
      .map(({transform}) => (transform))

      let transformSet: TransformSetArray<C> = margeMatcher(matchedTransforms)
      if(first) {
        transformSet = margeMatcher([first, transformSet])
      }

      if(final) {
        transformSet = margeMatcher([transformSet, final])
      }

      return transformSet
    })
  }
}
