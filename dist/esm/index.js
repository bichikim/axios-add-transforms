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
import { getMatchedMatchers, margeMatcher, mergeArrays, transFormError, transFormRequest, } from '@/utils';
export { margeMatcher, mergeArrays, transFormRequest, getMatchedMatchers, transFormError, } from '@/utils';
function _createCacheKey(url, method) {
    return method + ">" + url;
}
var Transforms = /** @class */ (function () {
    function Transforms(options) {
        if (options === void 0) { options = {}; }
        this._interceptorId = null;
        this._cache = new Map();
        this._options = __assign({}, options);
    }
    Object.defineProperty(Transforms.prototype, "first", {
        get: function () {
            return this._options.first;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transforms.prototype, "final", {
        get: function () {
            return this._options.final;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transforms.prototype, "context", {
        get: function () {
            var _a = this._options.context, context = _a === void 0 ? function () { return ({}); } : _a;
            return context();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transforms.prototype, "matchers", {
        get: function () {
            var _a = this._options.matchers, matchers = _a === void 0 ? [] : _a;
            return matchers;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Eject transform
     * @param axios
     */
    Transforms.prototype.ejectTransform = function (axios) {
        if (!this._interceptorId) {
            return;
        }
        axios.interceptors.request.eject(this._interceptorId.request);
        axios.interceptors.response.eject(this._interceptorId.response);
        this._interceptorId = null;
    };
    /**
     * Apply transform
     * @param axios
     * @param options
     */
    Transforms.prototype.applyTransform = function (axios, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        if (this._interceptorId) {
            return this._interceptorId;
        }
        var margeResponse = options.margeResponse;
        var context = this.context;
        // request & response transform
        var requestId = axios.interceptors.request.use(function (config) {
            var _a = config.url, url = _a === void 0 ? '/' : _a, _b = config.method, method = _b === void 0 ? 'get' : _b;
            // get transform
            var transformSet = _this._saveCache(url, method, function () { return (_this._getTransformSet(url, method)); });
            // request
            var newConfig = transFormRequest(transformSet.request, __assign({}, config), context);
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
            newConfig.transformResponse = transformResponse.map(function (transform) { return function (data) { return (transform(data, context)); }; });
            return newConfig;
        });
        // error transform
        var responseId = axios.interceptors.response.use(function (res) { return (res); }, function (error) {
            var config = error.config;
            if (!error.config) {
                throw error;
            }
            var _a = config.url, url = _a === void 0 ? '/' : _a, _b = config.method, method = _b === void 0 ? 'get' : _b;
            var transformSet = _this._saveCache(url, method, function () { return (_this._getTransformSet(url, method)); });
            var _c = transFormError(transformSet.error, error, _this.context), result = _c.error, retry = _c.retry;
            if (result instanceof Error) {
                if (retry) {
                    return Promise.resolve().then(function () { return (axios.request(result.config)); });
                }
                return Promise.reject(result);
            }
            return result;
        });
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
    Transforms.prototype.addInterceptors = function (axios, options) {
        if (options === void 0) { options = {}; }
        this.applyTransform(axios, options);
        return axios;
    };
    Transforms.prototype._saveCache = function (url, method, save) {
        var key = _createCacheKey(url, method);
        var value = this._cache.get(key);
        if (!value) {
            var value_1 = save();
            this._cache.set(key, value_1);
            return value_1;
        }
        return value;
    };
    /**
     * Find matched transforms
     */
    Transforms.prototype._getTransformSet = function (url, method) {
        var _a = this, matchers = _a.matchers, final = _a.final, first = _a.first;
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
    };
    return Transforms;
}());
export default Transforms;
//# sourceMappingURL=index.js.map