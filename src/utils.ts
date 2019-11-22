import {AxiosRequestConfig} from 'axios'
import {
  AxiosErrorEx,
  Matcher,
  TransformerRequest,
  TransformerResponse,
  TransformError,
  TransFormerStatus,
  TransformMethod,
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

export function mergeArrays<T = any>(items: Array<T | T[] | object | undefined | null>): T[] {
  return items.reduce<any[]>((result: any[], item: any) => {
    if(Array.isArray(item)) {
      result.push(...item)
    } else if(typeof item === 'object' && item !== null) {
      result.push(...Object.keys(item).map((key) => (item[key])))
    } else if(item) {
      result.push(item)
    }
    return result
  }, [])
}

export function transFormRequest<C>(
  transforms: Array<TransformerRequest<C>>,
  config: AxiosRequestConfig,
  context: C,
): Promise<AxiosRequestConfig> {
  return forEachPromise(transforms, config, context)
}

export function transFormError<C>(
  transforms: Array<TransformError<C>>,
  error: AxiosErrorEx,
  context: C,
  status: TransFormerStatus,
): Promise<AxiosErrorEx> {
  return forEachPromise(transforms, error, context, status)
}

export function getMatchedMatchers(
  matchers: Matcher[],
  /* istanbul ignore next  no way to test*/
  url: string = '/',
  method?: TransformMethod,
) {
  const _method = method && method.toUpperCase()
  return matchers.reduce<Matcher[]>((matchedMatchers, matcher) => {
    const {method, test} = matcher
    const matcherMethod = method && method.toUpperCase()
    let isMatchMethod = false
    if(matcherMethod === 'ALL' || !method || !_method) {
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
  return matchers.reduce((
    result: TransformSetArray<C>,
    /* istanbul ignore next  no way to test */
    transform: TransformSet = {},
  ) => {
    result.request = mergeArrays<TransformerRequest<C>>([result.request, transform.request])
    result.response = mergeArrays<TransformerResponse<C>>([result.response, transform.response])
    result.error = mergeArrays<TransformError<C>>([result.error, transform.error])
    return result
  }, {
    request: [],
    response: [],
    error: [],
  })
}

export function createCacheKey(url: string, method: string): string {
  return `${method}>${url}`
}
