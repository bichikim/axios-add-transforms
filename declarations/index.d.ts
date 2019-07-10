import { AxiosInstance, AxiosTransformer, Method, AxiosRequestConfig } from 'axios';
declare type Transformer = (data: AxiosRequestConfig) => AxiosRequestConfig;
export interface TransformSetArray {
    request: AxiosTransformer[];
    response: AxiosTransformer[];
}
export interface TransformSet {
    request?: Transformer | Transformer[];
    response?: AxiosTransformer | AxiosTransformer[];
}
export interface Matcher {
    test: RegExp;
    method?: 'all' | 'ALL' | Method;
    transform: TransformSet;
}
export interface TransformsOptions {
    first?: TransformSet;
    final?: TransformSet;
    matchers?: Matcher[];
}
export interface AddInterceptorsOptions {
    /**
     * @default 'back'
     */
    margeResponse?: 'back' | 'front' | 'none';
}
export default class Transforms {
    static confirmTransforms(transformSet?: TransformSet): TransformSetArray;
    static mergeArray(a: any, b: any): any[];
    private readonly _options;
    constructor(options: TransformsOptions);
    readonly matchers: Matcher[];
    addInterceptors(axios: AxiosInstance, options?: AddInterceptorsOptions): AxiosInstance;
    private _getMatcher;
}
export {};
