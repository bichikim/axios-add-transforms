import { AxiosInstance } from 'axios';
import { InterceptorIds, MargeResponse, Matcher, TransformSet, TransformsOptions } from './types';
export * from './types';
export * from './utils';
export declare class StatusMapper<K extends object, S> {
    private readonly _statusMap;
    private readonly _creator;
    constructor(creator: (() => K));
    removeStatus(key: K): void;
    getStatus(key: K): S | undefined;
    saveStatus(key: K, value: S): void;
    createStatus(value: S): K;
    getStatusInMany(keys: any[] | any): {
        key: any;
        value: S;
    } | {
        key: undefined;
        value: undefined;
    };
}
export default class Transforms<C = any> {
    private readonly _options;
    private _interceptorId;
    private readonly _cache;
    private readonly _statusMap;
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
