import {AxiosRequestConfig, AxiosResponse} from 'axios'
import {
  AxiosErrorEx,
  Matcher,
  Method,
  Transformer,
  TransformerResponse,
  TransformError,
  TransFormErrorResult,
  TransformSet,
  TransformSetArray,
} from './types'

export function forEachPromise(items, value: any, ...args: any[]) {
  return items.reduce((promise, item) => {
    return promise.then((value) => {
      const result = item(value, ...args)
      if(typeof result.then === 'function') {
        return result
      }
      return Promise.resolve(result)
    })
  }, Promise.resolve(value))
}

export function mergeArrays<T = any>(items: Array<T | T[] | undefined | null>): T[] {
  return items.reduce((result: T[], item: T | T[] | undefined | null) => {
    if(Array.isArray(item)) {
      result.push(...item)
    } else if(item) {
      result.push(item)
    }
    return result
  }, [])
}

export function transFormRequest<C>(
  transforms: Array<Transformer<C>>,
  config: AxiosRequestConfig,
  context: C,
): AxiosRequestConfig {
  return forEachPromise(transforms, config, context)
}

export function transFormError<C>(
  transforms: Array<TransformError<C>>,
  error: AxiosErrorEx,
  context: C,
): Promise<AxiosErrorEx> {
  return forEachPromise(transforms, error, context)
}

export function getMatchedMatchers(matchers: Matcher[], url: string = '/', method?: Method) {
  const _method = method && method.toUpperCase()
  return matchers.reduce<Matcher[]>((matchedMatchers, matcher) => {
    const {method, test} = matcher
    const matcherMethod = method && method.toUpperCase()
    let isMatchMethod = false
    if(matcher.method === 'ALL' || !method || !_method) {
      isMatchMethod = true
    } else {
      isMatchMethod = _method === matcherMethod
    }
    if(isMatchMethod && test.test(url)) {
      matchedMatchers.push(matcher)
    }
    return matchedMatchers
  }, [])
}

export function margeMatcher<C>(matchers: TransformSet[]): TransformSetArray<C> {
  return matchers.reduce((result: TransformSetArray<C>, transform: TransformSet = {}) => {
    result.request = mergeArrays<Transformer<C>>([result.request, transform.request])
    result.response = mergeArrays<TransformerResponse<C>>([result.response, transform.response])
    result.error = mergeArrays<TransformError<C>>([result.error, transform.error])
    return result
  }, {
    request: [],
    response: [],
    error: [],
  })
}
