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
define("types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function mergeArrays(items) {
        return items.reduce(function (result, item) {
            if (Array.isArray(item)) {
                result.push.apply(result, item);
            }
            else if (item) {
                result.push(item);
            }
            return result;
        }, []);
    }
    exports.mergeArrays = mergeArrays;
    function transFormRequest(transforms, config, context) {
        return transforms.reduce(function (result, transform) {
            return transform(result, context);
        }, config);
    }
    exports.transFormRequest = transFormRequest;
    function transFormError(transforms, error, context) {
        return transforms.reduce(function (result, transform) {
            var error = result.error;
            var data = transform(error, error.config, context);
            if (Array.isArray(data)) {
                var error_1 = data[0], retry = data[1];
                result.error = error_1;
                result.retry = retry;
                return result;
            }
            result.error = data;
            result.retry = false;
            return result;
        }, { error: error, retry: false });
    }
    exports.transFormError = transFormError;
    function getMatchedMatchers(matchers, url, method) {
        if (url === void 0) { url = '/'; }
        var _method = method && method.toUpperCase();
        return matchers.reduce(function (matchedMatchers, matcher) {
            var method = matcher.method, test = matcher.test;
            var matcherMethod = method && method.toUpperCase();
            var isMatchMethod = false;
            if (matcher.method === 'ALL' || !method || !_method) {
                isMatchMethod = true;
            }
            else {
                isMatchMethod = _method === matcherMethod;
            }
            if (isMatchMethod && test.test(url)) {
                matchedMatchers.push(matcher);
            }
            return matchedMatchers;
        }, []);
    }
    exports.getMatchedMatchers = getMatchedMatchers;
    function margeMatcher(matchers) {
        return matchers.reduce(function (result, transform) {
            if (transform === void 0) { transform = {}; }
            result.request = mergeArrays([result.request, transform.request]);
            result.response = mergeArrays([result.response, transform.response]);
            result.error = mergeArrays([result.error, transform.error]);
            return result;
        }, {
            request: [],
            response: [],
            error: [],
        });
    }
    exports.margeMatcher = margeMatcher;
});
define("index", ["require", "exports", "utils", "utils"], function (require, exports, utils_1, utils_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(utils_2);
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
                var newConfig = utils_1.transFormRequest(transformSet.request, __assign({}, config), context);
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
                var transformResponse = utils_1.mergeArrays(responseTransforms);
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
                var _c = utils_1.transFormError(transformSet.error, error, _this.context), result = _c.error, retry = _c.retry;
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
            var matchedTransforms = utils_1.getMatchedMatchers(matchers, url, method)
                .map(function (_a) {
                var transform = _a.transform;
                return (transform);
            });
            var transformSet = utils_1.margeMatcher(matchedTransforms);
            if (first) {
                transformSet = utils_1.margeMatcher([first, transformSet]);
            }
            if (final) {
                transformSet = utils_1.margeMatcher([transformSet, final]);
            }
            return transformSet;
        };
        return Transforms;
    }());
    exports.default = Transforms;
});
//# sourceMappingURL=index.js.map