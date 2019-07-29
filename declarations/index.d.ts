import { AxiosInstance, AxiosRequestConfig, AxiosTransformer, Method } from 'axios';
declare type Transformer<C = any> = (payload: AxiosRequestConfig, context?: C) => AxiosRequestConfig;
declare type TransformerResponse<C = any> = (data: any, context?: C) => any;
export interface TransformSetArray {
    request: AxiosTransformer[];
    response: AxiosTransformer[];
}
export interface TransformSet<C = any> {
    request?: Transformer<C> | Array<Transformer<C>>;
    response?: TransformerResponse<C> | Array<TransformerResponse<C>>;
}
export interface Matcher {
    test: RegExp;
    method?: 'all' | 'ALL' | Method;
    transform: TransformSet;
}
export interface TransformsOptions<C = any> {
    first?: TransformSet;
    final?: TransformSet;
    matchers?: Matcher[];
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
    constructor(options: TransformsOptions);
    readonly first: TransformSet<any> | undefined;
    readonly final: TransformSet<any> | undefined;
    readonly context: C | undefined;
    readonly matchers: Matcher[];
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
export {};
