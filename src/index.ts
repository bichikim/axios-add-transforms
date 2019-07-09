import {AxiosInstance, AxiosTransformer, Method} from 'axios'
import {toUpper} from 'lodash'

interface TransFormResponseData {
  data: any,
  headers: any
}

interface TransFormRequestData {
  data: any,
  headers: any,
  params: any
}

type Transformer = (data: TransFormRequestData) => TransFormRequestData

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
  ) {
    axios.interceptors.request.use(
      (config) => {
        const mather = this._getMatcher(config.url, config.method)
        if(!mather) {
          return config
        }
        const transformSet = Transforms.confirmTransforms(mather.transform)
        const transformedData = transformSet.request.reduce((
          result: TransFormRequestData,
          transform: Transformer,
        ) => {
          return transform(result)
        }, {
          data: config.data,
          headers: config.headers,
          params: config.params,
        })
        return Object.assign(config, transformedData, {
          transformResponse: transformSet.response,
        })
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
