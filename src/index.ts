import {AxiosInstance, AxiosRequestConfig, AxiosTransformer, Method} from 'axios'
import {toUpper} from 'lodash'

export type Transformer<C = any> =
  (payload: AxiosRequestConfig, context: C) => AxiosRequestConfig
export type TransformerResponse<C = any> =
  (data: any, context: C) => any

export interface TransformSetArray {
  request: AxiosTransformer[]
  response: AxiosTransformer[]
}

export interface TransformSet<C = any> {
  request?: Transformer<C> | Array<Transformer<C>>
  response?: TransformerResponse<C> | Array<TransformerResponse<C>>
}

export interface Matcher<C = any> {
  test: RegExp
  method?: 'all' | 'ALL' | Method
  transform: TransformSet<C>
}

export interface TransformsOptions<C = any> {
  first?: TransformSet<C>
  final?: TransformSet<C>
  matchers?: Array<Matcher<C>>
  context?: () => C
}

export interface AddInterceptorsOptions {
  /**
   * @default 'back'
   */
  margeResponse?: 'back' | 'front' | 'none'
}

export default class Transforms<C = any> {
  static confirmTransforms(transformSet?: TransformSet): TransformSetArray {
    if(!transformSet) {
      return {
        request: [],
        response: [],
      }
    }
    let request: AxiosTransformer[]
    let response: AxiosTransformer[]
    if(!transformSet.request) {
      request = []
    } else if(Array.isArray(transformSet.request)) {
      request = transformSet.request
    } else {
      request = [transformSet.request]
    }
    if(!transformSet.response) {
      response = []
    } else if(Array.isArray(transformSet.response)) {
      response = transformSet.response
    } else {
      response = [transformSet.response]
    }
    return {
      request,
      response,
    }
  }

  static mergeArray(a: any, b: any) {
    let _a: any[]
    let _b: any[]
    if(Array.isArray(a)) {
      _a = a
    } else if(!a) {
      _a = []
    } else {
      _a = [a]
    }
    if(Array.isArray(b)) {
      _b = b
    } else if(!b) {
      _b = []
    } else {
      _b = [b]
    }
    return [..._a, ..._b]
  }

  private readonly _options: TransformsOptions

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
    const {matchers} = this._options
    if(!matchers) {
      return []
    }
    return matchers
  }

  constructor(options: TransformsOptions = {}) {
    this._options = options
  }

  /**
   * Add Interceptors for response & request transforms
   */
  addInterceptors(
    axios: AxiosInstance,
    options: AddInterceptorsOptions = {},
  ) {
    const {margeResponse} = options
    const {_mutateAxiosTransformer} = this
    axios.interceptors.request.use(
      (config) => {
        const transform = this._getTransformSet(config.url, config.method)
        // no transform skip running
        const transformSet = Transforms.confirmTransforms(transform)

        // transform config by matchers
        const transformedConfig = transformSet.request.reduce((
          result: AxiosRequestConfig,
          transform: Transformer,
        ) => {
          return transform(result, this.context)
        }, {...config})

        Object.assign(config, transformedConfig)
        // add response transforms
        let transformResponse: AxiosTransformer[]

        // how to merge response transforms
        switch(margeResponse) {
          case 'front':
            transformResponse = Transforms
            .mergeArray(transformSet.response, config.transformResponse)
            break
          case 'back':
            transformResponse = Transforms
            .mergeArray(config.transformResponse, transformSet.response)
            break
          default:
            transformResponse = transformSet.response
        }

        // update transformResponse
        Object.assign(
          config,
          {transformResponse: _mutateAxiosTransformer.call(this, transformResponse)},
        )
        return config
      },
    )

    // for chaining use
    return axios
  }

  /**
   * Make transformResponse can use context
   */
  private _mutateAxiosTransformer(
    transformResponse: Array<TransformerResponse<C>>,
  ): AxiosTransformer[] {
    const {context} = this
    return transformResponse.map((transform) => {
      return (data) => (transform(data, context))
    })
  }

  /**
   * Find matched transforms
   */
  private _getTransformSet(
    url: string = '/',
    _method?: Method,
  ): TransformSet<C> {
    const {matchers, final, first} = this
    const matchedMatchers: Matcher[] = []
    for(const matcher of matchers) {
      const method = toUpper(_method)
      const matcherMethod = toUpper(matcher.method)
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
        result.request = Transforms.mergeArray(result.request, transform.request)
        result.response = Transforms.mergeArray(result.response, transform.response)
        return result
      }, {
        request: [],
        response: [],
      })
    }

    if(first) {
      transformSet = {
        request: Transforms.mergeArray(first.request, transformSet.request),
        response: Transforms.mergeArray(first.response, transformSet.response),
      }
    }

    if(final) {
      transformSet = {
        request: Transforms.mergeArray(transformSet.request, final.request),
        response: Transforms.mergeArray(transformSet.response, final.response),
      }
    }

    return transformSet
  }
}
