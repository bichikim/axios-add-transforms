import { AxiosInstance } from 'axios';
import { InterceptorIds, MargeResponse, Matcher, TransformSet, TransformsOptions } from './types';
export * from './types';
export * from './utils';
export default class Transforms<C = any> {
    private readonly _options;
    /**
     *  axios interceptor request & resolve id
     */
    private _interceptorId;
    /**
     * matcher cache
     */
    private readonly _cache;
    /**
     * first options
     */
    get first(): TransformSet<C> | undefined;
    /**
     * get final options
     */
    get final(): TransformSet<C> | undefined;
    get maxCache(): number | undefined | null;
    /**
     * get context options
     * run context function and return context
     */
    get context(): C;
    /**
     * get matchers options
     * make sure matchers is an array
     */
    get matchers(): Matcher[];
    /**
     * get margeResponse options
     */
    get margeResponse(): MargeResponse | undefined;
    /**
     * Save Transforms options
     * @param options
     */
    constructor(options?: TransformsOptions);
    /**
     * Eject transform
     * eject request & response which is applied by Transforms.applyTransform
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
     * @param url axios.url
     * @param method axios.method
     * @param save how to save logic function
     * @private
     */
    private _saveCache;
    /**
     * Find matched transforms
     * @param url axios.url
     * @param method axios.url & 'all' , 'ALL' all means all of method
     */
    private _getTransformSet;
}
