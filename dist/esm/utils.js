var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
export function forEachPromise(items, value) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return items.reduce(function (promise, item) {
        return promise.then(function (value) {
            var result = item.apply(void 0, __spreadArrays([value], args));
            if (typeof result.then === 'function') {
                return result;
            }
            return Promise.resolve(result);
        });
    }, Promise.resolve(value));
}
export function mergeArrays(items) {
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
export function transFormRequest(transforms, config, context) {
    return forEachPromise(transforms, config, context);
}
export function transFormError(transforms, error, context) {
    return forEachPromise(transforms, error, context);
}
export function getMatchedMatchers(matchers, url, method) {
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
export function margeMatcher(matchers) {
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
//# sourceMappingURL=utils.js.map