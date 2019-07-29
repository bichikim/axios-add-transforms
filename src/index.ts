import {AxiosInstance, AxiosRequestConfig, AxiosTransformer, Method} from 'axios'
import {toUpper} from 'lodash'

type Transformer<C = any> =
  (payload: AxiosRequestConfig, context?: C) => AxiosRequestConfig
type TransformerResponse<C = any> =
  (data: any, context?: C) => any

export interface TransformSetArray {
  request: AxiosTransformer[]
  response: AxiosTransformer[]
}

export interface TransformSet<C = any> {
  request?: Transformer<C> | Array<Transformer<C>>
  response?: TransformerResponse<C> | Array<TransformerResponse<C>>
}

export interface Matcher {
  test: RegExp
  method?: 'all' | 'ALL' | Method
  transform: TransformSet
}

export interface TransformsOptions<C = any> {
  first?: TransformSet
  final?: TransformSet
  matchers?: Matcher[]
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

  constructor(options: TransformsOptions) {
    this._options = options
  }

  get first() {
    return this._options.first
  }

  get final() {
    return this._options.final
  }

  get context(): C | undefined {
    const {context} = this._options
    if(context) {
      return context()
    }
    return undefined
  }

  get matchers(): Matcher[] {
    const {matchers} = this._options
    if(!matchers) {
      return []
    }
    return matchers
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
        if(!transform) {return config}
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
    return transformResponse.map((transform) => {
      return (data) => (transform(data, this.context))
    })
  }

  /**
   * Find matched transforms
   */
  private _getTransformSet(
    url: string = '/',
    _method?: Method,
    ): TransformSet<C> | undefined {
    const {matchers, first, final} = this
    const matchedMatchers: Matcher[] = []
    for(let matcher of matchers) {
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

    if(matchedMatchers.length < 1) {
      return
    }

    let request: Array<Transformer<C>> = []
    let response: AxiosTransformer[] = []
    if(first) {
      request = Transforms.mergeArray(request, first.request)
      response = Transforms.mergeArray(response, first.response)
    }

    const transformSet = matchedMatchers.reduce((result: TransformSet<C>, value) => {
      const {transform = {}} = value
      result.request = Transforms.mergeArray(result.request, transform.request)
      result.response = Transforms.mergeArray(result.response, transform.response)
      return result
    }, {
      request,
      response,
    })
    if(final) {
      return {
        request: Transforms.mergeArray(transformSet.request, final.request),
        response: Transforms.mergeArray(transformSet.response, final.response),
      }
    }
    return transformSet
  }
}
