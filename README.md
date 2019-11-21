# Axios add Transforms
>

[![LICENSE IMAGE]](https://www.npmjs.org/package/axios-add-transforms)
![npm](https://img.shields.io/npm/v/axios-add-transforms.svg)
[![codecov](https://codecov.io/gh/bichikim/axios-add-transforms/branch/master/graph/badge.svg)](https://codecov.io/gh/bichikim/axios-add-transforms)
[![Build Status](https://travis-ci.org/bichikim/axios-add-transforms.svg?branch=master)](https://travis-ci.org/bichikim/axios-add-transforms)

[LICENSE IMAGE]:https://img.shields.io/npm/l/axios-add-transforms.svg
[NPM LINK]:https://www.npmjs.org/package/axios-add-transforms

## How to use

### to add an interceptor


```typescript
import {AxiosRequestConfig} from 'axios'
import Transforms from './src'
import axios from 'axios'

const myAxios = axios.create({})
// refer to TransformsOptions
const transforms = new Transforms({
  context: () => ({axios: myAxios}),
  // first: TransformSet | TransformSet[]
  // final: TransformSet | TransformSet[]
  // margeResponse: 'front' | 'back' | undefined
  matchers: [
    {
      test: /^\/users\/?$/,
      // method: ...
      transform: {
        request: ({data: {foo, bar}, params, headers}) =>
         ({data: {'_foo': foo, '_bar': bar}, params, headers}),
        // response: Matcher | Matcher[]
        // error: Matcher | Matcher[]
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

/**
 * @deprecated
 */
// transforms.addInterceptors(myAxios)
transforms.applyTransform(myAxios)


// request data will ba {_foo: 'foo', _bar: 'bar'}
myAxios(config).then(() => {
  
})

// remove transform
transForms.ejectTransform(myAxios)

```

### retry request

```typescript
import Transforms from './src'

const trsnsforms = new Transforms({
  matchers: [
    {
      test: /^\/users\/?$/,
      transform: {
        error: async (error, context, status) => {
          // sign-in again
          await context.axios({
            url: 'sign-in',
            method: 'put'
          })
          if(!status.retry) {
            status.retry = 0
          }
          status.retry += 1
          // retry until three times
          error.retry = status < 3
          return error
        }
      }
    }
  ]
})



```
