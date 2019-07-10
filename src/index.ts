import {AxiosInstance, AxiosTransformer, Method, AxiosRequestConfig} from 'axios'
import {toUpper} from 'lodash'

interface TransFormResponseData {
  data: any,
  headers: any
}

type Transformer = (data: AxiosRequestConfig) => AxiosRequestConfig

export interface TransformSetArray {
  request: AxiosTransformer[]
  response: AxiosTransformer[]
}

export interface TransformSet {
  request?: Transformer | Transformer[]
  response?: AxiosTransformer | AxiosTransformer[]
}

export interface Matcher {
  test: RegExp
  method?: 'all' | 'ALL' | Method
  transform: TransformSet
}

export interface TransformsOptions {
  first?: TransformSet
  final?: TransformSet
  matchers?: Matcher[]
}

export interface AddInterceptorsOptions {
  /**
   * @default 'back'
   */
  margeResponse?: 'back' | 'front' | 'none'
}

export default class Transforms {
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

  get matchers(): Matcher[] {
    const {matchers} = this._options
    if(!matchers) {
      return []
    }
    return matchers
  }

  addInterceptors(
    axios: AxiosInstance,
    options: AddInterceptorsOptions = {},
  ) {
    const {margeResponse} = options
    axios.interceptors.request.use(
      (config) => {
        const mather = this._getMatcher(config.url, config.method)
        if(!mather) {
          return config
        }
        const transformSet = Transforms.confirmTransforms(mather.transform)
        const transformedConfig = transformSet.request.reduce((
          result: AxiosRequestConfig,
          transform: Transformer,
        ) => {
          return transform(result)
        }, {...config})
        Object.assign(config, transformedConfig)
        let transformResponse: AxiosTransformer[]
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
        Object.assign(config, {transformResponse})
        return config
      },
    )
    return axios
  }

  private _getMatcher(url: string = '/', _method?: Method): Matcher | undefined {
    const {matchers} = this
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
        return matcher
      }
    }
  }
}
