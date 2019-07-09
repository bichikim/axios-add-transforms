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
            var _a, _b, _c, _d;
            var 
            /* istanbul ignore next The test dose not need to check*/
            _e = config.url, 
            /* istanbul ignore next The test dose not need to check*/
            url = _e === void 0 ? '/' : _e, transformRequest = config.transformRequest, transformResponse = config.transformResponse;
            var confirmTransforms = Transforms.confirmTransforms;
            var matchers = this.matchers;
            var _f = this._options, first = _f.first, final = _f.final;
            var finalTransformSet = confirmTransforms(final);
            var firstTransformSet = confirmTransforms(first);
            var currentTransformSet = confirmTransforms({
                request: transformRequest,
                response: transformResponse,
            });
            var newConfig = __assign({}, config, { transformRequest: firstTransformSet.request.concat(currentTransformSet.request), transformResponse: firstTransformSet.response.concat(currentTransformSet.response) });
            for (var _i = 0, matchers_1 = matchers; _i < matchers_1.length; _i++) {
                var matcher = matchers_1[_i];
                var test_1 = matcher.test;
                var methodTest = false;
                var method = lodash_1.toUpper(matcher.method);
                if (method === 'ALL' || !method || !config.method) {
                    methodTest = true;
                }
                else {
                    methodTest = lodash_1.toUpper(config.method) === method;
                }
                if (test_1.test(url) && methodTest) {
                    var transformSet = confirmTransforms(matcher.transform);
                    (_a = newConfig.transformRequest).push.apply(_a, transformSet.request);
                    (_b = newConfig.transformResponse).push.apply(_b, transformSet.response);
                    break;
                }
            }
            (_c = newConfig.transformRequest).push.apply(_c, finalTransformSet.request);
            (_d = newConfig.transformResponse).push.apply(_d, finalTransformSet.response);
            return newConfig;
        };
        return Transforms;
    }());
    exports.default = Transforms;
});
//# sourceMappingURL=index.js.map