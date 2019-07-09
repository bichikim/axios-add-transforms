import {AxiosRequestConfig, AxiosTransformer, Method} from 'axios'
import {toUpper} from 'lodash'

export interface TransformSetArray {
  request: AxiosTransformer[]
  response: AxiosTransformer[]
}

export interface TransformSet {
  request?: AxiosTransformer | AxiosTransformer[]
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

  addTransforms(config: AxiosRequestConfig): AxiosRequestConfig {
    const {
      /* istanbul ignore next The test dose not need to check*/
      url = '/',
      transformRequest, transformResponse} = config
    const {confirmTransforms} = Transforms
    const {matchers} = this
    const {first, final} = this._options
    const finalTransformSet = confirmTransforms(final)
    const firstTransformSet = confirmTransforms(first)
    const currentTransformSet = confirmTransforms({
      request: transformRequest,
      response: transformResponse,
    })
    const newConfig = {
      ...config,
      transformRequest: [
        ...firstTransformSet.request,
        ...currentTransformSet.request,
      ],
      transformResponse: [
        ...firstTransformSet.response,
        ...currentTransformSet.response,
      ],
    }
    for(let matcher of matchers) {
      const {test} = matcher
      let methodTest: boolean = false
      const method = toUpper(matcher.method)
      if(method === 'ALL' || !method || !config.method) {
        methodTest = true
      } else {
        methodTest = toUpper(config.method) === method
      }

      if(test.test(url) && methodTest) {
        const transformSet = confirmTransforms(matcher.transform)
        newConfig.transformRequest.push(...transformSet.request)
        newConfig.transformResponse.push(...transformSet.response)
        break
      }
    }
    newConfig.transformRequest.push(...finalTransformSet.request)
    newConfig.transformResponse.push(...finalTransformSet.response)
    return newConfig
  }

}
