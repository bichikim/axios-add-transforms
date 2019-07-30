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
define("index", ["require", "exports", "lodash"], function (require, exports, lodash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Transforms = /** @class */ (function () {
        function Transforms(options) {
            this._options = options;
        }
        Transforms.confirmTransforms = function (transformSet) {
            if (!transformSet) {
                return {
                    request: [],
                    response: [],
                };
            }
            var request;
            var response;
            if (!transformSet.request) {
                request = [];
            }
            else if (Array.isArray(transformSet.request)) {
                request = transformSet.request;
            }
            else {
                request = [transformSet.request];
            }
            if (!transformSet.response) {
                response = [];
            }
            else if (Array.isArray(transformSet.response)) {
                response = transformSet.response;
            }
            else {
                response = [transformSet.response];
            }
            return {
                request: request,
                response: response,
            };
        };
        Transforms.mergeArray = function (a, b) {
            var _a;
            var _b;
            if (Array.isArray(a)) {
                _a = a;
            }
            else if (!a) {
                _a = [];
            }
            else {
                _a = [a];
            }
            if (Array.isArray(b)) {
                _b = b;
            }
            else if (!b) {
                _b = [];
            }
            else {
                _b = [b];
            }
            return _a.concat(_b);
        };
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
                var context = this._options.context;
                if (context) {
                    return context();
                }
                return undefined;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transforms.prototype, "matchers", {
            get: function () {
                var matchers = this._options.matchers;
                if (!matchers) {
                    return [];
                }
                return matchers;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Add Interceptors for response & request transforms
         */
        Transforms.prototype.addInterceptors = function (axios, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var margeResponse = options.margeResponse;
            var _mutateAxiosTransformer = this._mutateAxiosTransformer;
            axios.interceptors.request.use(function (config) {
                var transform = _this._getTransformSet(config.url, config.method);
                // no transform skip running
                var transformSet = Transforms.confirmTransforms(transform);
                // transform config by matchers
                var transformedConfig = transformSet.request.reduce(function (result, transform) {
                    return transform(result, _this.context);
                }, __assign({}, config));
                Object.assign(config, transformedConfig);
                // add response transforms
                var transformResponse;
                // how to merge response transforms
                switch (margeResponse) {
                    case 'front':
                        transformResponse = Transforms
                            .mergeArray(transformSet.response, config.transformResponse);
                        break;
                    case 'back':
                        transformResponse = Transforms
                            .mergeArray(config.transformResponse, transformSet.response);
                        break;
                    default:
                        transformResponse = transformSet.response;
                }
                // update transformResponse
                Object.assign(config, { transformResponse: _mutateAxiosTransformer.call(_this, transformResponse) });
                return config;
            });
            // for chaining use
            return axios;
        };
        /**
         * Make transformResponse can use context
         */
        Transforms.prototype._mutateAxiosTransformer = function (transformResponse) {
            var _this = this;
            return transformResponse.map(function (transform) {
                return function (data) { return (transform(data, _this.context)); };
            });
        };
        /**
         * Find matched transforms
         */
        Transforms.prototype._getTransformSet = function (url, _method) {
            if (url === void 0) { url = '/'; }
            var _c = this, matchers = _c.matchers, final = _c.final, first = _c.first;
            var matchedMatchers = [];
            for (var _i = 0, matchers_1 = matchers; _i < matchers_1.length; _i++) {
                var matcher = matchers_1[_i];
                var method = lodash_1.toUpper(_method);
                var matcherMethod = lodash_1.toUpper(matcher.method);
                var matchedMethod = false;
                if (matcher.method === 'ALL' || !matcher.method || !_method) {
                    matchedMethod = true;
                }
                else {
                    matchedMethod = method === matcherMethod;
                }
                if (matcher.test.test(url) && matchedMethod) {
                    matchedMatchers.push(matcher);
                }
            }
            var transformSet = {};
            if (matchedMatchers.length > 0) {
                transformSet = matchedMatchers.reduce(function (result, value) {
                    var _c = value.transform, transform = _c === void 0 ? {} : _c;
                    result.request = Transforms.mergeArray(result.request, transform.request);
                    result.response = Transforms.mergeArray(result.response, transform.response);
                    return result;
                }, {
                    request: [],
                    response: [],
                });
            }
            if (first) {
                transformSet = {
                    request: Transforms.mergeArray(first.request, transformSet.request),
                    response: Transforms.mergeArray(first.response, transformSet.response),
                };
            }
            if (final) {
                transformSet = {
                    request: Transforms.mergeArray(transformSet.request, final.request),
                    response: Transforms.mergeArray(transformSet.response, final.response),
                };
            }
            return transformSet;
        };
        return Transforms;
    }());
    exports.default = Transforms;
});
//# sourceMappingURL=index.js.map