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
    const {url = '/', transformRequest, transformResponse} = config
    const {matchers} = this
    for(let matcher of matchers) {
      const {test} = matcher
      let methodTest: boolean = false
      const method = toUpper(matcher.method)
      if(method === 'ALL' || !method || !config.method) {
        methodTest = true
      } else {
        methodTest = config.method === method
      }
      if(test.test(url) && methodTest) {
        const {confirmTransforms} = Transforms
        const transformSet = confirmTransforms(matcher.transform)
        const {first, final} = this._options
        const currentTransformSet = confirmTransforms({
          request: transformRequest,
          response: transformResponse,
        })
        const finalTransformSet = confirmTransforms(final)
        const firstTransformSet = confirmTransforms(first)
        return {
          ...config,
          transformRequest: [
            ...firstTransformSet.request,
            ...currentTransformSet.request,
            ...transformSet.request,
            ...finalTransformSet.request,
          ],
          transformResponse: [
            ...firstTransformSet.response,
            ...currentTransformSet.response,
            ...transformSet.response,
            ...finalTransformSet.response,
          ],
        }
      }
    }
    return config
  }

}
