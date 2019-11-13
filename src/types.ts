import {AxiosError, AxiosRequestConfig} from 'axios'

export type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' |
  'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string

export interface AxiosErrorEx extends AxiosError {
  retry?: boolean
  isError?: boolean
  config: AxiosRequestConfigEx
}

export interface AxiosRequestConfigEx extends AxiosRequestConfig {
  __oldConfig?: any
}

export interface InterceptorIds {
  request: number
  response: number
}

export type MargeResponse = 'back' | 'front' | 'none'

export interface TransFormerStatus {
  retry?: number
  originalConfig?: AxiosRequestConfig
}

export type StatusKeyFunction = (data: any) => any

/**
 * Request Transformer function
 * @deprecated
 */
export type Transformer<C = any> = TransformerRequest<C>

/**
 * Request Transformer function
 */
export type TransformerRequest<C = any> =
  (payload: AxiosRequestConfig, context: C) => Promise<AxiosRequestConfig> | AxiosRequestConfig

/**
 * Response Transformer function
 */
export type TransformerResponse<C = any> =
  (data: any, context: C, config: AxiosRequestConfigEx) => Promise<any> | any

/**
 * Error transformer function
 */
export type TransformError<C = any> =
  (error: AxiosErrorEx, context: C, status: TransFormerStatus)
    => Promise<AxiosError> | AxiosError

/**
 * Transform Set (has only array type)
 */
export interface TransformSetArray<C = any> {
  request: Array<TransformerRequest<C>>
  response: Array<TransformerResponse<C>>
  error: Array<TransformError<C>>
}

/**
 * Transform Set
 */
export interface TransformSet<C = any> {
  request?: TransformerRequest<C> | Array<TransformerRequest<C>>
  response?: TransformerResponse<C> | Array<TransformerResponse<C>>
  /**
   * This is like axios.interceptors.response.use(__, error)
   */
  error?: TransformError<C> | Array<TransformError<C>>
}

/**
 * Do transform if test is successful
 */
export interface Matcher<C = any> {
  test: RegExp
  // methods. All means all of method
  method?: 'all' | 'ALL' | Method
  transform: TransformSet<C>
}

/**
 * Transforms options
 */
export interface TransformsOptions<C = any> {
  first?: TransformSet<C>
  final?: TransformSet<C>
  matchers?: Array<Matcher<C>>
  margeResponse?: MargeResponse
  context?: () => C
}
