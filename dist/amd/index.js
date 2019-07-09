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
        Transforms.prototype.addTransforms = function (config) {
            var _a = config.url, url = _a === void 0 ? '/' : _a, transformRequest = config.transformRequest, transformResponse = config.transformResponse;
            var matchers = this.matchers;
            for (var _i = 0, matchers_1 = matchers; _i < matchers_1.length; _i++) {
                var matcher = matchers_1[_i];
                var test_1 = matcher.test;
                var methodTest = false;
                var method = lodash_1.toUpper(matcher.method);
                if (method === 'ALL' || !method || !config.method) {
                    methodTest = true;
                }
                else {
                    methodTest = config.method === method;
                }
                if (test_1.test(url) && methodTest) {
                    var confirmTransforms = Transforms.confirmTransforms;
                    var transformSet = confirmTransforms(matcher.transform);
                    var _b = this._options, first = _b.first, final = _b.final;
                    var currentTransformSet = confirmTransforms({
                        request: transformRequest,
                        response: transformResponse,
                    });
                    var finalTransformSet = confirmTransforms(final);
                    var firstTransformSet = confirmTransforms(first);
                    return __assign({}, config, { transformRequest: firstTransformSet.request.concat(currentTransformSet.request, transformSet.request, finalTransformSet.request), transformResponse: firstTransformSet.response.concat(currentTransformSet.response, transformSet.response, finalTransformSet.response) });
                }
            }
            return config;
        };
        return Transforms;
    }());
    exports.default = Transforms;
});
//# sourceMappingURL=index.js.map