import { AxiosInstance, AxiosRequestConfig, AxiosTransformer, Method } from 'axios';
export interface TransformSetArray {
    request: AxiosTransformer[];
    response: AxiosTransformer[];
}
export interface TransformSet {
    request?: AxiosTransformer | AxiosTransformer[];
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
export default class Transforms {
    static confirmTransforms(transformSet?: TransformSet): TransformSetArray;
    private readonly _options;
    constructor(options: TransformsOptions);
    readonly matchers: Matcher[];
    addTransforms(config: AxiosRequestConfig): AxiosRequestConfig;
    addInterceptors(axios: AxiosInstance, addExisting?: boolean): AxiosInstance;
}
