import { AxiosError, AxiosRequestConfig } from 'axios';
declare module 'axios/index' {
    interface AxiosRequestConfig {
        /**
         * info for transformer
         */
        info?: any | (() => any);
    }
    interface AxiosInstance {
        (config: AxiosRequestConfig): AxiosPromise;
        (url: string, config?: AxiosRequestConfig): AxiosPromise;
    }
}
export declare type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string;
export interface AxiosErrorEx extends AxiosError {
    retry?: boolean;
    isError?: boolean;
    config: AxiosRequestConfigEx;
}
export interface Status {
    retry?: number;
}
export interface AxiosRequestConfigEx extends AxiosRequestConfig {
    __status?: Status;
    __config?: AxiosRequestConfig;
}
export interface InterceptorIds {
    request: number;
    response: number;
}
export declare type MargeResponse = 'back' | 'front' | 'none';
export interface TransFormerStatus {
    retry?: number;
    originalConfig?: AxiosRequestConfigEx;
}
/**
 * Request Transformer function
 * @deprecated
 */
export declare type Transformer<C = any> = TransformerRequest<C>;
/**
 * Request Transformer function
 */
export declare type TransformerRequest<C = any> = (payload: AxiosRequestConfigEx, context: C) => Promise<AxiosRequestConfigEx> | AxiosRequestConfigEx;
/**
 * Response Transformer function
 */
export declare type TransformerResponse<C = any> = (data: any, context: C, config: AxiosRequestConfigEx) => Promise<any> | any;
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
    method?: 'all' | 'ALL' | Method;
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
    context?: () => C;
}
