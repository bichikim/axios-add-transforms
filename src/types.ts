import {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios'

export type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' |
  'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string

export interface AxiosErrorEx extends AxiosError {
  retry?: boolean
  isError?: boolean
}

export interface InterceptorIds {
  request: number
  response: number
}

export interface ErrorStatus {
  retry: number
}

export type ErrorReturn = [AxiosError, boolean] | AxiosError

export interface TransFormErrorResult {
  error: AxiosErrorEx | AxiosResponse
  retry: boolean
}

export type TransErrorReturn = AxiosErrorEx | [AxiosError, boolean]

export type Transformer<C = any> =
  (payload: AxiosRequestConfig, context: C) => Promise<AxiosRequestConfig> | AxiosRequestConfig
export type TransformerResponse<C = any> =
  (data: any, context: C) => Promise<any> | any
export type TransformError<C = any> =
  (error: AxiosErrorEx, context: C)
    => Promise<AxiosError> | AxiosError

export interface TransformSetArray<C = any> {
  request: Array<Transformer<C>>
  response: Array<TransformerResponse<C>>
  error: Array<TransformError<C>>
}

export interface TransformSet<C = any> {
  request?: Transformer<C> | Array<Transformer<C>>
  response?: TransformerResponse<C> | Array<TransformerResponse<C>>
  /**
   * This is like axios.interceptors.response.use(__, error)
   */
  error?: TransformError<C> | Array<TransformError<C>>
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
