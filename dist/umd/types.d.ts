import { AxiosError, AxiosRequestConfig, Method, Status } from 'axios';
declare module 'axios/index' {
    interface Status {
        retry?: number | boolean | null;
        originalConfig: AxiosRequestConfig;
    }
    interface AxiosRequestConfig {
        __status?: Status | null;
        __config?: AxiosRequestConfig | null;
    }
    interface AxiosInstance {
        (config: AxiosRequestConfig): AxiosPromise;
        (url: string, config?: AxiosRequestConfig): AxiosPromise;
    }
}
/**
 * axios method for transform
 */
export declare type TransformMethod = 'all' | 'ALL' | Method;
export interface AxiosErrorEx extends AxiosError {
    /**
     * @deprecated please use example
     * @example
     *  error(error, context, status) {
     *    // this is save as error.retry = true
     *    status.retry = true
     *  }
     */
    retry?: boolean;
    config: AxiosRequestConfig;
}
export interface InterceptorIds {
    request: number;
    response: number;
}
export declare type MargeResponse = 'back' | 'front' | 'none';
export interface TransFormerStatus extends Status {
    retry?: any;
}
/**
 * Request Transformer function
 * @deprecated
 */
export declare type Transformer<C = any> = TransformerRequest<C>;
/**
 * Request Transformer function
 */
export declare type TransformerRequest<C = any> = (payload: AxiosRequestConfig, context: C) => Promise<AxiosRequestConfig> | AxiosRequestConfig;
/**
 * Response Transformer function
 */
export declare type TransformerResponse<C = any> = (data: any, context: C, config: AxiosRequestConfig) => Promise<any> | any;
/**
 * Error transformer function
 */
export declare type TransformError<C = any> = (error: AxiosErrorEx, context: C, status: TransFormerStatus) => Promise<AxiosError> | AxiosError;
/**
 * Transform Set (has only array type)
 */
export interface TransformSetArray<C = any> {
    request: Array<TransformerRequest<C>>;
    response: Array<TransformerResponse<C>>;
    error: Array<TransformError<C>>;
}
/**
 * Transform Set
 */
export interface TransformSet<C = any> {
    request?: TransformerRequest<C> | Array<TransformerRequest<C>>;
    response?: TransformerResponse<C> | Array<TransformerResponse<C>>;
    /**
     * This is like axios.interceptors.response.use(__, error)
     */
    error?: TransformError<C> | Array<TransformError<C>>;
}
/**
 * Do transform if test is successful
 */
export interface Matcher<C = any> {
    test: RegExp;
    method?: TransformMethod;
    transform: TransformSet<C>;
}
/**
 * Transforms options
 */
export interface TransformsOptions<C = any> {
    first?: TransformSet<C>;
    final?: TransformSet<C>;
    matchers?: Array<Matcher<C>>;
    margeResponse?: MargeResponse;
    maxCache?: number | null;
    context?: () => C;
}
