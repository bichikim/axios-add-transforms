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
    return transforms.reduce(function (result, transform) {
        return transform(result, context);
    }, config);
}
export function transFormError(transforms, error, context) {
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