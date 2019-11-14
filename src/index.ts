import {AxiosInstance, AxiosRequestConfig, AxiosTransformer} from 'axios'
import {
  AxiosErrorEx,
  AxiosRequestConfigEx,
  InterceptorIds,
  MargeResponse,
  Matcher,
  Method,
  TransformerResponse,
  TransformSet,
  TransformSetArray,
  TransformsOptions,
} from './types'
import {
  createCacheKey,
  getInfo,
  getMatchedMatchers,
  margeMatcher,
  mergeArrays,
  transFormError,
  transFormRequest,
} from './utils'

export * from './types'
export * from './utils'

export default class Transforms<C = any> {

  private readonly _options: TransformsOptions

  private _interceptorId: InterceptorIds | null = null

  private readonly _cache: Map<string, TransformSetArray<C>> = new Map()

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
  addInterceptors(axios: AxiosInstance) {
    this.applyTransform(axios)
    return axios
  }

  /**
   * Return AxiosTransformer form response
   * @param config
   * @private
   */
  private _getResponseTransforms(config: AxiosRequestConfig): AxiosTransformer[] {
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
      const originalConfig = config.__config
      /* istanbul ignore if  no way to test*/
      if(!originalConfig) {
        throw error
      }

      let status = config.__status
      /* istanbul ignore else  no way to test*/
      if(!status) {
        status = {}
        config.__status = status
      }

      error.config.info = getInfo(originalConfig)

      const {url, method} = originalConfig
      const transformSet = this._getTransformSet(url, method)
      error.isError = true
      const _error: AxiosErrorEx = await transFormError<C>(
        transformSet.error, error, this.context, status)
      if(_error.retry) {
        return Promise.resolve().then(() => {
          return axios(originalConfig)
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
      const _config = config.__config || config
      const {url, method} = _config
      if(!config.__config) {
        config.__config = config
      }

      const info = getInfo(_config)

      // get transform
      const transformSet = this._getTransformSet(url, method)
      // request
      const newConfig = await transFormRequest(
        transformSet.request,
        {..._config, info},
        context,
      )

      // response
      newConfig.transformResponse = this._getResponseTransforms({..._config, info})
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
    save: (() => TransformSetArray<C>),
  ): TransformSetArray<C> {
    const key = createCacheKey(url, method)
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
    /* istanbul ignore next no way to test*/
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
