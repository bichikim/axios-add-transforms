import {AxiosInstance, AxiosRequestConfig} from 'axios'
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
  getMatchedMatchers,
  margeMatcher,
  mergeArrays,
  transFormError,
  transFormRequest,
} from './utils'

export * from './types'
export * from './utils'

function _createCacheKey(url: string, method: string): string {
  return `${method}>${url}`
}

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
  ejectTransform(axios: AxiosInstance): void {
    if(!this._interceptorId) {
      return
    }
    axios.interceptors.request.eject(this._interceptorId.request)
    axios.interceptors.response.eject(this._interceptorId.response)
    this._interceptorId = null
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

  private _getResponseTransforms(config: AxiosRequestConfig) {
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

  private _errorInterceptors(axios: AxiosInstance) {
    return async (error: AxiosErrorEx) => {
      const {config} = error
      if(!error.config) {
        throw error
      }
      const {__oldConfig} = config
      if(__oldConfig) {
        config.url = __oldConfig.url
        config.method = __oldConfig.method
      }

      if(typeof config.data === 'string') {
        try {
          config.data = JSON.parse(config.data)
        } catch(e) {
          // skip
        }
      }
      const {url = '/', method = 'get'} = config
      const transformSet = this._saveCache(
        url, method,
        () => (this._getTransformSet(url, method)),
      )
      error.isError = true
      const _error: AxiosErrorEx = await transFormError<C>(
        transformSet.error, error, this.context)
      if(_error.isError) {
        if(_error.retry) {
          return Promise.resolve().then(() => {
            // reset transform
            _error.config.transformResponse = []
            _error.config.transformRequest = []
            return axios.request(_error.config)
          })
        }
        return Promise.reject(_error)
      }
      // @ts-ignore
      return Promise.resolve(_error.response)
    }
  }

  private _requestInterceptors() {
    return async (config: AxiosRequestConfigEx) => {
      const {context} = this
      const {__oldConfig} = config
      let {url = '/', method = 'get'} = config
      if(__oldConfig) {
        url = __oldConfig.url
        method = __oldConfig.method
      }

      // get transform
      const transformSet = this._getTransformSet(url, method)
      const payloadConfig = {...config, __oldConfig: {...config}}
      // request
      const newConfig = await transFormRequest(
        transformSet.request,
        payloadConfig,
        context,
      )

      // response
      newConfig.transformResponse = this._getResponseTransforms(payloadConfig)
      return newConfig
    }
  }

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
    method: Method = 'get',
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
