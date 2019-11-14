import { AxiosInstance } from 'axios';
import { InterceptorIds, MargeResponse, Matcher, TransformSet, TransformsOptions } from './types';
export * from './types';
export * from './utils';
export default class Transforms<C = any> {
    private readonly _options;
    private _interceptorId;
    private readonly _cache;
    get first(): TransformSet<C> | undefined;
    get final(): TransformSet<C> | undefined;
    get context(): C;
    get matchers(): Matcher[];
    get margeResponse(): MargeResponse | undefined;
    constructor(options?: TransformsOptions);
    /**
     * Eject transform
     * @param axios
     */
    ejectTransform(axios: AxiosInstance): boolean;
    /**
     * Apply transform
     * @param axios
     */
    applyTransform(axios: AxiosInstance): InterceptorIds;
    /**
     * Add Interceptors for response & request transforms
     * @deprecated
     */
    addInterceptors(axios: AxiosInstance): AxiosInstance;
    /**
     * Return AxiosTransformer form response
     * @param config
     * @private
     */
    private _getResponseTransforms;
    /**
     * Return error interceptor
     * @param axios axios instance
     * @private
     */
    private _errorInterceptors;
    /**
     * Return request interceptor
     * @private
     */
    private _requestInterceptors;
    /**
     * Manage match cache
     * @param url
     * @param method
     * @param save
     * @private
     */
    private _saveCache;
    /**
     * Find matched transforms
     */
    private _getTransformSet;
}
