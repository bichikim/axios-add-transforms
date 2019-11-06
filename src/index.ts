import {
  AddInterceptorsOptions,
  AxiosErrorEx,
  Matcher,
  sSecond,
  sInstance,
  Transformer,
  TransformerResponse,
  TransformError,
  TransformSet,
  TransformSetArray,
  TransformsOptions,
} from '@/types'
import {confirmTransforms, mergeArrays, transFormError, transFormRequest} from '@/utils'
import {AxiosInstance, AxiosRequestConfig, AxiosTransformer, Method} from 'axios'

export * from '@/types'
export * from '@/utils'

function _createCacheKey(url: string, method: string): string {
  return `${method}>${url}`
}

export default class Transforms<C = any> {

  private readonly _options: TransformsOptions
  private _id: { request, response } | null = null
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

  constructor(options: TransformsOptions = {}) {
    this._options = {...options}
  }

  /**
   * Eject transform
   * @param axios
   */
  ejectTransform(axios: AxiosInstance) {
    if(!this._id) {
      return
    }
    axios.interceptors.request.eject(this._id.request)
    axios.interceptors.response.eject(this._id.response)
  }

  /**
   * Apply transform
   * @param axios
   * @param options
   */
  applyTransform(axios: AxiosInstance, options: AddInterceptorsOptions = {}) {
    if(this._id) {
      return
    }
    const {margeResponse} = options
    const {context} = this

    // request & response transform
    const requestId = axios.interceptors.request.use((config: AxiosRequestConfig) => {
      const {url = '/', method = 'get'} = config
      // get transform
      const transformSet = this._saveCache(
        url,
        method,
        () => (this._getTransformSet(url, method)),
      )

      // request
      const newConfig = transFormRequest(transformSet.request, {...config}, context)

      // response
      const responseTransforms:
        Array<TransformerResponse<C> | Array<TransformerResponse<C>> | undefined> = []
      if(margeResponse === 'front') {
        responseTransforms.push(transformSet.response, config.transformResponse)
      } else if(margeResponse === 'back') {
        responseTransforms.push(config.transformResponse, transformSet.response)
      } else {
        responseTransforms.push(transformSet.response)
      }
      const transformResponse = mergeArrays<AxiosTransformer>(responseTransforms)
      newConfig.transformResponse = transformResponse.map(
        (transform) => (data) => (transform(data, context)),
      )
      return newConfig
    })

    // error transform
    const responseId = axios.interceptors.response.use((res) => (res),
      (error: AxiosErrorEx) => {
        const {config , response} = error
        const {status = 200} = response || {}
        if(!error.config) {
          throw error
        }
        const {url = '/', method = 'get'} = config
        const transformSet = this._saveCache(
          url, method,
          () => (this._getTransformSet(url, method)),
        )
        const newError: AxiosErrorEx = transFormError<C>(transformSet.error, error, this.context)
      })

    this._id = {
      request: requestId,
      response: responseId,
    }
  }

  /**
   * Add Interceptors for response & request transforms
   * @deprecated
   */
  addInterceptors(
    axios: AxiosInstance,
    options: AddInterceptorsOptions = {},
  ) {
    this.applyTransform(axios, options)
    return axios
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
    _method?: Method,
  ): TransformSetArray<C> {
    const {matchers, final, first} = this
    const matchedMatchers: Matcher[] = []
    for(const matcher of matchers) {
      const method = _method && _method.toUpperCase()
      const matcherMethod = matcher.method && matcher.method.toUpperCase()
      let matchedMethod = false
      if(matcher.method === 'ALL' || !matcher.method || !_method) {
        matchedMethod = true
      } else {
        matchedMethod = method === matcherMethod
      }
      if(matcher.test.test(url) && matchedMethod) {
        matchedMatchers.push(matcher)
      }
    }

    let transformSet: TransformSet<C> = {}

    if(matchedMatchers.length > 0) {
      transformSet = matchedMatchers.reduce((result: TransformSet<C>, value) => {
        const {transform = {}} = value
        result.request = mergeArrays<Transformer<C>>([result.request, transform.request])
        result.response = mergeArrays<TransformerResponse<C>>([result.response, transform.response])
        result.error = mergeArrays<TransformError<C>>([result.response, transform.error])
        return result
      }, {
        request: [],
        response: [],
        error: [],
      })
    }

    if(first) {
      transformSet = {
        request: mergeArrays<Transformer<C>>([first.request, transformSet.request]),
        response: mergeArrays<TransformerResponse<C>>([first.response, transformSet.response]),
        error: mergeArrays<TransformError<C>>([first.error, transformSet.error]),
      }
    }

    if(final) {
      transformSet = {
        request: mergeArrays<Transformer<C>>([transformSet.request, final.request]),
        response: mergeArrays<TransformerResponse<C>>([transformSet.response, final.response]),
        error: mergeArrays<TransformError<C>>([transformSet.error, final.error]),
      }
    }

    return confirmTransforms(transformSet)
  }
}
