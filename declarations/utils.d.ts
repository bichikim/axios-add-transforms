import { AxiosRequestConfig } from 'axios';
import { AxiosErrorEx, AxiosRequestConfigEx, Matcher, Method, TransformerRequest, TransformError, TransFormerStatus, TransformSet, TransformSetArray } from './types';
export declare function forEachPromise(items: any, value: any, ...args: any[]): any;
export declare function mergeArrays<T = any>(items: Array<T | T[] | undefined | null>): T[];
export declare function transFormRequest<C>(transforms: Array<TransformerRequest<C>>, config: AxiosRequestConfigEx, context: C): Promise<AxiosRequestConfig>;
export declare function transFormError<C>(transforms: Array<TransformError<C>>, error: AxiosErrorEx, context: C, status: TransFormerStatus): Promise<AxiosErrorEx>;
export declare function getMatchedMatchers(matchers: Matcher[], url?: string, method?: Method): Matcher<any>[];
export declare function margeMatcher<C>(matchers: TransformSet[]): TransformSetArray<C>;
