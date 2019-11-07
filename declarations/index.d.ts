import { AddInterceptorsOptions, InterceptorIds, Matcher, TransformSet, TransformsOptions } from '@/types';
import { AxiosInstance } from 'axios';
export { AxiosErrorEx, ErrorStatus, TransformSet, Matcher, Method, TransformerResponse, TransformSetArray, Transformer, TransformsOptions, AddInterceptorsOptions, InterceptorIds, TransformError, TransFormErrorResult, } from '@/types';
export { margeMatcher, mergeArrays, transFormRequest, getMatchedMatchers, transFormError, } from '@/utils';
export default class Transforms<C = any> {
    private readonly _options;
    private _interceptorId;
    private readonly _cache;
    readonly first: TransformSet<C> | undefined;
    readonly final: TransformSet<C> | undefined;
    readonly context: C;
    readonly matchers: Matcher[];
    constructor(options?: TransformsOptions);
    /**
     * Eject transform
     * @param axios
     */
    ejectTransform(axios: AxiosInstance): void;
    /**
     * Apply transform
     * @param axios
     * @param options
     */
    applyTransform(axios: AxiosInstance, options?: AddInterceptorsOptions): InterceptorIds;
    /**
     * Add Interceptors for response & request transforms
     * @deprecated
     */
    addInterceptors(axios: AxiosInstance, options?: AddInterceptorsOptions): AxiosInstance;
    private _saveCache;
    /**
     * Find matched transforms
     */
    private _getTransformSet;
}
