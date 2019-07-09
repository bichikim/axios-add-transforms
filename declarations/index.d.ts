import { AxiosInstance, AxiosTransformer, Method } from 'axios';
interface TransFormRequestData {
    data: any;
    headers: any;
    params: any;
}
declare type Transformer = (data: TransFormRequestData) => TransFormRequestData;
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
export default class Transforms {
    static confirmTransforms(transformSet?: TransformSet): TransformSetArray;
    private readonly _options;
    constructor(options: TransformsOptions);
    readonly matchers: Matcher[];
    addInterceptors(axios: AxiosInstance): AxiosInstance;
    private _getMatcher;
}
export {};
