import { AxiosInstance, AxiosRequestConfig, AxiosTransformer, Method } from 'axios';
export declare type Transformer<C = any> = (payload: AxiosRequestConfig, context: C) => AxiosRequestConfig;
export declare type TransformerResponse<C = any> = (data: any, context: C) => any;
export interface TransformSetArray {
    request: AxiosTransformer[];
    response: AxiosTransformer[];
}
export interface TransformSet<C = any> {
    request?: Transformer<C> | Array<Transformer<C>>;
    response?: TransformerResponse<C> | Array<TransformerResponse<C>>;
}
export interface Matcher<C = any> {
    test: RegExp;
    method?: 'all' | 'ALL' | Method;
    transform: TransformSet<C>;
}
export interface TransformsOptions<C = any> {
    first?: TransformSet<C>;
    final?: TransformSet<C>;
    matchers?: Array<Matcher<C>>;
    context?: () => C;
}
export interface AddInterceptorsOptions {
    /**
     * @default 'back'
     */
    margeResponse?: 'back' | 'front' | 'none';
}
export default class Transforms<C = any> {
    static confirmTransforms(transformSet?: TransformSet): TransformSetArray;
    static mergeArray(a: any, b: any): any[];
    private readonly _options;
    readonly first: TransformSet<C> | undefined;
    readonly final: TransformSet<C> | undefined;
    readonly context: C;
    readonly matchers: Matcher[];
    constructor(options?: TransformsOptions);
    /**
     * Add Interceptors for response & request transforms
     */
    addInterceptors(axios: AxiosInstance, options?: AddInterceptorsOptions): AxiosInstance;
    /**
     * Make transformResponse can use context
     */
    private _mutateAxiosTransformer;
    /**
     * Find matched transforms
     */
    private _getTransformSet;
}
