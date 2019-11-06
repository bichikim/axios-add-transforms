import {
  AxiosErrorEx,
  Transformer,
  TransformerResponse,
  TransformError,
  TransformSet,
  TransformSetArray,
} from '@/types'
import {AxiosError, AxiosRequestConfig} from 'axios'

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

export function confirmTransforms<C>(transformSet?: TransformSet<C>): TransformSetArray<C> {
  const {request, response, error} = transformSet || {} as any
  return {
    request: mergeArrays<Transformer<C>>([request]),
    response: mergeArrays<TransformerResponse<C>>([response]),
    error: mergeArrays<TransformError<C>>([error]),
  }
}

export function transFormRequest<C>(
  transforms: Array<Transformer<C>>,
  config: AxiosRequestConfig,
  context: C,
): AxiosRequestConfig {
  return transforms.reduce((
    result: AxiosRequestConfig,
    transform: Transformer,
  ) => {
    return transform(result, context)
  }, config)
}

export function transFormError<C>(
  transforms: Array<TransformError<C>>,
  error: AxiosError,
  context: C,
): AxiosErrorEx {
  return transforms.reduce((error: AxiosErrorEx, transform: TransformError<C>) => {
    return transform(error, context, error.config)
  }, error)
}
