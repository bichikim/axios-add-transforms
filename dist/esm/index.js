import { toUpper } from 'lodash';
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
    Transforms.prototype.addInterceptors = function (axios) {
        var _this = this;
        axios.interceptors.request.use(function (config) {
            var mather = _this._getMatcher(config.url, config.method);
            if (!mather) {
                return config;
            }
            var transformSet = Transforms.confirmTransforms(mather.transform);
            var transformedData = transformSet.request.reduce(function (result, transform) {
                return transform(result);
            }, {
                data: config.data,
                headers: config.headers,
                params: config.params,
            });
            return Object.assign(config, transformedData, {
                transformResponse: transformSet.response,
            });
        });
        return axios;
    };
    Transforms.prototype._getMatcher = function (url, _method) {
        if (url === void 0) { url = '/'; }
        var matchers = this.matchers;
        for (var _i = 0, matchers_1 = matchers; _i < matchers_1.length; _i++) {
            var matcher = matchers_1[_i];
            var method = toUpper(_method);
            var matcherMethod = toUpper(matcher.method);
            var matchedMethod = false;
            if (matcher.method === 'ALL' || !matcher.method || !_method) {
                matchedMethod = true;
            }
            else {
                matchedMethod = method === matcherMethod;
            }
            if (matcher.test.test(url) && matchedMethod) {
                return matcher;
            }
        }
    };
    return Transforms;
}());
export default Transforms;
//# sourceMappingURL=index.js.map