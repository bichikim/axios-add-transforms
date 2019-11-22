var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { cloneDeep } from 'lodash';
import { createCacheKey, getMatchedMatchers, margeMatcher, mergeArrays, transFormError, transFormRequest, } from './utils';
export * from './utils';
var Transforms = /** @class */ (function () {
    /**
     * Save Transforms options
     * @param options
     */
    function Transforms(options) {
        if (options === void 0) { options = {}; }
        /**
         *  axios interceptor request & resolve id
         */
        this._interceptorId = null;
        /**
         * matcher cache
         */
        this._cache = new Map();
        this._options = __assign({}, options);
    }
    Object.defineProperty(Transforms.prototype, "first", {
        /**
         * first options
         */
        get: function () {
            return this._options.first;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transforms.prototype, "final", {
        /**
         * get final options
         */
        get: function () {
            return this._options.final;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transforms.prototype, "maxCache", {
        get: function () {
            return this._options.maxCache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transforms.prototype, "context", {
        /**
         * get context options
         * run context function and return context
         */
        get: function () {
            var _a = this._options.context, context = _a === void 0 ? function () { return ({}); } : _a;
            return context();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transforms.prototype, "matchers", {
        /**
         * get matchers options
         * make sure matchers is an array
         */
        get: function () {
            var _a = this._options.matchers, matchers = _a === void 0 ? [] : _a;
            return matchers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transforms.prototype, "margeResponse", {
        /**
         * get margeResponse options
         */
        get: function () {
            var margeResponse = this._options.margeResponse;
            return margeResponse;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Eject transform
     * eject request & response which is applied by Transforms.applyTransform
     * @param axios
     */
    Transforms.prototype.ejectTransform = function (axios) {
        if (!this._interceptorId) {
            return false;
        }
        axios.interceptors.request.eject(this._interceptorId.request);
        axios.interceptors.response.eject(this._interceptorId.response);
        this._interceptorId = null;
        return true;
    };
    /**
     * Apply transform
     * @param axios
     */
    Transforms.prototype.applyTransform = function (axios) {
        if (this._interceptorId) {
            return this._interceptorId;
        }
        // request & response transform
        var requestId = axios.interceptors
            .request.use(this._requestInterceptors());
        // error transform
        var responseId = axios.interceptors
            .response.use(function (res) { return (res); }, this._errorInterceptors(axios));
        this._interceptorId = {
            request: requestId,
            response: responseId,
        };
        return this._interceptorId;
    };
    /**
     * Add Interceptors for response & request transforms
     * @deprecated
     */
    Transforms.prototype.addInterceptors = function (axios) {
        this.applyTransform(axios);
        return axios;
    };
    /**
     * Return AxiosTransformer form response
     * @param config
     * @private
     */
    Transforms.prototype._getResponseTransforms = function (config) {
        var _a = this, margeResponse = _a.margeResponse, context = _a.context;
        var url = config.url, method = config.method;
        var transformSet = this._getTransformSet(url, method);
        // response
        var responseTransforms = [];
        if (margeResponse === 'front') {
            responseTransforms.push(transformSet.response, config.transformResponse);
        }
        else if (margeResponse === 'back') {
            responseTransforms.push(config.transformResponse, transformSet.response);
        }
        else {
            responseTransforms.push(transformSet.response);
        }
        var transformResponse = mergeArrays(responseTransforms);
        return transformResponse.map(function (transform) { return function (data) { return (transform(data, context, config)); }; });
    };
    /**
     * Return error interceptor
     * @param axios axios instance
     * @private
     */
    Transforms.prototype._errorInterceptors = function (axios) {
        var _this = this;
        return function (error) { return __awaiter(_this, void 0, void 0, function () {
            var config, originalConfig, status, url, method, transformSet, _error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = error.config;
                        if (!config) {
                            throw error;
                        }
                        originalConfig = config.__config;
                        /* istanbul ignore if  no way to test*/
                        if (!originalConfig) {
                            throw error;
                        }
                        status = config.__status;
                        /* istanbul ignore else  no way to test*/
                        if (!status) {
                            status = { originalConfig: originalConfig };
                            config.__status = status;
                        }
                        url = originalConfig.url, method = originalConfig.method;
                        transformSet = this._getTransformSet(url, method);
                        return [4 /*yield*/, transFormError(transformSet.error, error, this.context, status)];
                    case 1:
                        _error = _a.sent();
                        if (status.retry || _error.retry) {
                            return [2 /*return*/, Promise.resolve().then(function () {
                                    return axios(originalConfig);
                                })];
                        }
                        // @ts-ignore
                        return [2 /*return*/, Promise.reject(_error)];
                }
            });
        }); };
    };
    /**
     * Return request interceptor
     * @private
     */
    Transforms.prototype._requestInterceptors = function () {
        var _this = this;
        return function (config) { return __awaiter(_this, void 0, void 0, function () {
            var context, _config, url, method, transformSet, newConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = this.context;
                        _config = config.__config || config;
                        url = _config.url, method = _config.method;
                        // else coverage needed
                        if (!config.__config) {
                            config.__config = __assign(__assign({}, config), { __config: null, method: cloneDeep(config.method), data: cloneDeep(config.data), headers: cloneDeep(config.headers), params: cloneDeep(config.params), auth: cloneDeep(config.auth), proxy: cloneDeep(config.proxy) });
                        }
                        transformSet = this._getTransformSet(url, method);
                        return [4 /*yield*/, transFormRequest(transformSet.request, __assign({}, _config), context)
                            // add  response into transformResponse to transform response after request
                        ];
                    case 1:
                        newConfig = _a.sent();
                        // add  response into transformResponse to transform response after request
                        newConfig.transformResponse = this._getResponseTransforms(__assign({}, _config));
                        return [2 /*return*/, newConfig];
                }
            });
        }); };
    };
    /**
     * Manage match cache
     * @param url axios.url
     * @param method axios.method
     * @param save how to save logic function
     * @private
     */
    Transforms.prototype._saveCache = function (url, method, save) {
        var _a = this, maxCache = _a.maxCache, _cache = _a._cache;
        var key = createCacheKey(url, method);
        var value = _cache.get(key);
        if (!value) {
            value = save();
            _cache.set(key, value);
            if (maxCache && _cache.size > 0 && maxCache <= _cache.size) {
                _cache.delete(_cache.keys()[0]);
            }
        }
        return value;
    };
    /**
     * Find matched transforms
     * @param url axios.url
     * @param method axios.url & 'all' , 'ALL' all means all of method
     */
    Transforms.prototype._getTransformSet = function (url, 
    /* istanbul ignore next no way to test*/
    method) {
        var _this = this;
        if (url === void 0) { url = '/'; }
        if (method === void 0) { method = 'all'; }
        return this._saveCache(url, method, function () {
            var _a = _this, matchers = _a.matchers, final = _a.final, first = _a.first;
            var matchedTransforms = getMatchedMatchers(matchers, url, method)
                .map(function (_a) {
                var transform = _a.transform;
                return (transform);
            });
            var transformSet = margeMatcher(matchedTransforms);
            if (first) {
                transformSet = margeMatcher([first, transformSet]);
            }
            if (final) {
                transformSet = margeMatcher([transformSet, final]);
            }
            return transformSet;
        });
    };
    return Transforms;
}());
export default Transforms;
//# sourceMappingURL=index.js.map