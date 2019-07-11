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
        Transforms.prototype.addInterceptors = function (axios, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var margeResponse = options.margeResponse;
            axios.interceptors.request.use(function (config) {
                var transform = _this._getTransformSet(config.url, config.method);
                if (!transform) {
                    return config;
                }
                var transformSet = Transforms.confirmTransforms(transform);
                var transformedConfig = transformSet.request.reduce(function (result, transform) {
                    return transform(result);
                }, __assign({}, config));
                Object.assign(config, transformedConfig);
                var transformResponse;
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
                Object.assign(config, { transformResponse: transformResponse });
                return config;
            });
            return axios;
        };
        Transforms.prototype._getTransformSet = function (url, _method) {
            if (url === void 0) { url = '/'; }
            var matchers = this.matchers;
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
            if (matchedMatchers.length < 1) {
                return;
            }
            return matchedMatchers.reduce(function (result, value) {
                var _c = value.transform, transform = _c === void 0 ? {} : _c;
                result.request = Transforms.mergeArray(result.request, transform.request);
                result.response = Transforms.mergeArray(result.response, transform.response);
                return result;
            }, {
                request: [],
                response: [],
            });
        };
        return Transforms;
    }());
    exports.default = Transforms;
});
//# sourceMappingURL=index.js.map