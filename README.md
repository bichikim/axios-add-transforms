# Axios add Transforms
>

[![LICENSE IMAGE]](https://www.npmjs.org/package/axios-add-transforms)
![npm](https://img.shields.io/npm/v/axios-add-transforms.svg)
[![codecov](https://codecov.io/gh/bichikim/axios-add-transforms/branch/master/graph/badge.svg)](https://codecov.io/gh/bichikim/axios-add-transforms)
[![Build Status](https://travis-ci.com/bichikim/axios-add-transforms.svg?branch=master)](https://travis-ci.com/bichikim/axios-add-transforms)

[LICENSE IMAGE]:https://img.shields.io/npm/l/axios-add-transforms.svg
[NPM LINK]:https://www.npmjs.org/package/axios-add-transforms
## How to use
```typescript
import {AxiosRequestConfig} from 'axios'
import Transforms from './src'
import axios, {Method} from 'axios'

// refer to TransformsOptions
const transforms = new Transforms({
  // first: ...
 
  final: {
    request: (data) => (JSON.stringify(data)),
    // response: ...
  },
  matchers: [
    {
      test: /^\/users\//,
      transform: {
        request: ({foo, bar}) => ({'_foo': foo, '_bar': bar}),
        // response: ...
      }
    }
  ]
})

const config: AxiosRequestConfig = {
  url: '/users/',
  data: {
    foo: 'foo',
    bar: 'bar',
  }
}
import axios, {Method} from 'axios'

// request data will ba {_foo: 'foo', _bar: 'bar'}
axios(config).then(() => {
  
})

```
