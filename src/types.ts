import {AxiosError, AxiosInstance, AxiosRequestConfig, Method} from 'axios'

export const sInstance = Symbol('instance')
export const sSecond = Symbol('first')

export interface AxiosErrorEx extends AxiosError {
  config: AxiosRequestConfigEx
}

export interface AxiosRequestConfigEx extends AxiosRequestConfig {
  retry?: boolean | number
  [sInstance]?: AxiosInstance
  [sSecond]?: boolean
}

export type Transformer<C = any> =
  (payload: AxiosRequestConfig, context: C) => AxiosRequestConfig
export type TransformerResponse<C = any> =
  (data: any, context: C) => any
export type TransformError<C = any> =
  (error: AxiosErrorEx, context: C, config: AxiosRequestConfig) => AxiosErrorEx

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
  retry?: boolean | number
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
