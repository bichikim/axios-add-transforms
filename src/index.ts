import {
  AddInterceptorsOptions,
  AxiosErrorEx,
  InterceptorIds,
  Matcher,
  Method,
  TransformerResponse,
  TransFormErrorResult,
  TransformSet,
  TransformSetArray,
  TransformsOptions,
} from '@/types'
import {
  getMatchedMatchers,
  margeMatcher,
  mergeArrays,
  transFormError,
  transFormRequest,
} from '@/utils'
import {AxiosInstance, AxiosRequestConfig, AxiosTransformer} from 'axios'

export {
  AxiosErrorEx,
  ErrorStatus,
  TransformSet,
  Matcher,
  Method,
  TransformerResponse,
  TransformSetArray,
  Transformer,
  TransformsOptions,
  AddInterceptorsOptions,
  InterceptorIds,
  TransformError,
  TransFormErrorResult,
} from '@/types'
export {
  margeMatcher,
  mergeArrays,
  transFormRequest,
  getMatchedMatchers,
  transFormError,
} from '@/utils'

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
   * @param options
   */
  applyTransform(axios: AxiosInstance, options: AddInterceptorsOptions = {}): InterceptorIds {
    if(this._interceptorId) {
      return this._interceptorId
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
        const {config} = error
        if(!error.config) {
          throw error
        }
        const {url = '/', method = 'get'} = config
        const transformSet = this._saveCache(
          url, method,
          () => (this._getTransformSet(url, method)),
        )
        const {error: result, retry}: TransFormErrorResult = transFormError<C>(
          transformSet.error, error, this.context)
        if(result instanceof Error) {

          if(retry) {
            return Promise.resolve().then(() => (
              axios.request(result.config)
            ))
          }
          return Promise.reject(result)
        }
        return result
      })

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
    url: string,
    method?: Method,
  ): TransformSetArray<C> {
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
  }
}
