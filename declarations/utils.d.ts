import { AxiosErrorEx, Matcher, Method, Transformer, TransformError, TransFormErrorResult, TransformSet, TransformSetArray } from '@/types';
import { AxiosRequestConfig } from 'axios';
export declare function mergeArrays<T = any>(items: Array<T | T[] | undefined | null>): T[];
export declare function transFormRequest<C>(transforms: Array<Transformer<C>>, config: AxiosRequestConfig, context: C): AxiosRequestConfig;
export declare function transFormError<C>(transforms: Array<TransformError<C>>, error: AxiosErrorEx, context: C): TransFormErrorResult;
export declare function getMatchedMatchers(matchers: Matcher[], url?: string, method?: Method): Matcher<any>[];
export declare function margeMatcher<C>(matchers: TransformSet[]): TransformSetArray<C>;
