import { AxiosInstance } from 'axios';
import { InterceptorIds, MargeResponse, Matcher, TransformSet, TransformsOptions } from './types';
export * from './types';
export * from './utils';
export default class Transforms<C = any> {
    private readonly _options;
    private _interceptorId;
    private readonly _cache;
    readonly first: TransformSet<C> | undefined;
    readonly final: TransformSet<C> | undefined;
    readonly context: C;
    readonly matchers: Matcher[];
    readonly margeResponse: MargeResponse | undefined;
    constructor(options?: TransformsOptions);
    /**
     * Eject transform
     * @param axios
     */
    ejectTransform(axios: AxiosInstance): void;
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
    private _getResponseTransforms;
    private _errorInterceptors;
    private _requestInterceptors;
    private _saveCache;
    /**
     * Find matched transforms
     */
    private _getTransformSet;
}
