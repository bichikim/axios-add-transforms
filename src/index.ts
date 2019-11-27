import {AxiosInstance, AxiosRequestConfig, AxiosTransformer} from 'axios'
import {cloneDeep} from 'lodash'
import {
  AxiosErrorEx,
  InterceptorIds,
  MargeResponse,
  Matcher,
  TransformerResponse,
  TransformMethod,
  TransformSet,
  TransformSetArray,
  TransformsOptions,
} from './types'
import {
  createCacheKey,
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

  /**
   *  axios interceptor request & resolve id
   */
  private _interceptorId: InterceptorIds | null = null

  /**
   * matcher cache
   */
  private readonly _cache: Map<string, TransformSetArray<C>> = new Map()

  /**
   * first options
   */
  get first(): TransformSet<C> | undefined {
    return this._options.first
  }

  /**
   * get final options
   */
  get final(): TransformSet<C> | undefined {
    return this._options.final
  }

  get maxCache(): number | undefined | null {
    return this._options.maxCache
  }

  /**
   * get context options
   * run context function and return context
   */
  get context(): C {
    const {context = () => ({})} = this._options

    return context()
  }

  /**
   * get matchers options
   * make sure matchers is an array
   */
  get matchers(): Matcher[] {
    const {matchers = []} = this._options

    return matchers
  }

  /**
   * get margeResponse options
   */
  get margeResponse(): MargeResponse | undefined {
    const {margeResponse} = this._options

    return margeResponse
  }

  /**
   * Save Transforms options
   * @param options
   */
  constructor(options: TransformsOptions = {}) {
    this._options = {...options}
  }

  /**
   * Eject transform
   * eject request & response which is applied by Transforms.applyTransform
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
        status = {originalConfig}
        config.__status = status
      }

      const {url, method} = originalConfig
      const transformSet = this._getTransformSet(url, method)
      const _error: AxiosErrorEx = await transFormError<C>(
        transformSet.error, error, this.context, status)

      if(status.retry || _error.retry) {
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
    ((config: AxiosRequestConfig) => Promise<AxiosRequestConfig>) {
    return async (config: AxiosRequestConfig) => {
      const {context} = this
      const _config = config.__config || config
      const {url, method} = _config

      // else coverage needed
      if(!config.__config) {
        config.__config = {
          ...config,
          __config: null,
          method: cloneDeep(config.method),
          data: cloneDeep(config.data),
          headers: cloneDeep(config.headers),
          params: cloneDeep(config.params),
          auth: cloneDeep(config.auth),
          proxy: cloneDeep(config.proxy),
        }
      }

      // get transform set
      const transformSet = this._getTransformSet(url, method)

      // transform request
      const newConfig = await transFormRequest(
        transformSet.request,
        {..._config},
        context,
      )

      // add  response into transformResponse to transform response after request
      newConfig.transformResponse = this._getResponseTransforms({..._config})
      return newConfig
    }
  }

  /**
   * Manage match cache
   * @param url axios.url
   * @param method axios.method
   * @param save how to save logic function
   * @private
   */
  private _saveCache(
    url: string,
    method: string,
    save: (() => TransformSetArray<C>),
  ): TransformSetArray<C> {
    const {maxCache, _cache} = this
    const key = createCacheKey(url, method)
    let value = _cache.get(key)

    if(!value) {
      value = save()

      _cache.set(key, value)

      if(maxCache && _cache.size > 0 && maxCache <= _cache.size) {
        _cache.delete(_cache.keys()[0])
      }
    }

    return value
  }

  /**
   * Find matched transforms
   * @param url axios.url
   * @param method axios.url & 'all' , 'ALL' all means all of method
   */
  private _getTransformSet(
    url: string = '/',
    /* istanbul ignore next no way to test*/
    method: TransformMethod = 'all',
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
