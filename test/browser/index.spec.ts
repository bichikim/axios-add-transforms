import Transforms, {AddInterceptorsOptions, confirmTransforms, TransformsOptions} from '@/index'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import config from 'config/webpack.base.config'

describe('lib/transforms', function test() {
  const newTest = (
    options: TransformsOptions = {},
    addInterceptorsOptions?: AddInterceptorsOptions,
  ) => {
    const myAxios = axios.create()
    const mock = new MockAdapter(myAxios)
    const {final, matchers = [], first} = options
    const response = {
      result: {
        '_id': 1,
        '_name': 'foo',
      },
    }

    const request = {
      url: '/bizs/',
      data: {
        foo: 'foo',
        bar: 'bar',
      },
    }

    const requestParam = {
      url: '/bizs/',
      params: {
        foo: 'foo',
        bar: 'bar',
      },
    }

    const expectData = {
      '_foo': 'foo',
      '_bar': 'bar',
    }

    const expectResponse = {
      result: {
        id: 1,
        name: 'foo',
      },
    }
    const transforms = new Transforms({
      first,
      final,
      context: () => ('context'),
      matchers: [
        ...matchers,
        {
          test: /^\/.{4}\//,
          // Test empty transform
        } as any,
        {
          test: /^\/.{4}\//,
          transform: {
            request: (payload) => {
              payload.headers.token = payload.headers.accessToken
              delete payload.headers.accessToken
              return payload
            },
          },
        },
        {
          test: /^\/bizs\//,
          transform: {
            request: ({data, headers, params, ...others}) => {
              return {
                ...others,
                data: data && {
                  '_foo': data.foo,
                  '_bar': data.bar,
                },
                headers,
                params: params && {
                  '_foo': params.foo,
                  '_bar': params.bar,
                },
              }
            },
            response: (data) => {
              if(!data) {
                return data
              }
              if(!data.result) {
                return {
                  code: data._code,
                  message: data._message,
                }
              }
              const {result} = data
              const {_id, _name, ...etc} = result
              const newData: any = {
                result: {
                  ...etc,
                  id: _id, name: _name,
                },
              }
              return newData
            },
          },
        },
        {
          test: /^\/context\/?/,
          method: 'get',
          transform: {
            request: (config, context) => ({
              ...config,
              data: {
                ...config.data,
                contextRequest: context,
              },
            }),
            response: (data, context) => ({
              ...data,
              contextResponse: context,
            }),
          },
        },
        {
          test: /^\/foos\//,
          method: 'get',
          transform: {
            request: ({data, headers, params, ...others}) => ({
              ...others,
              data: data && {
                '_foo': data.foo,
                '_bar': data.bar,
              },
              headers,
              params: params && {
                '_foo': params.foo,
                '_bar': params.bar,
              },
            }),
            response: ({result: {'_id': id, '_name': name, ...etc}}) => ({
              result: {
                ...etc,
                id, name,
              },
            }),
          },
        },
        {
          test: /^\/retry\/?/,
          method: 'post',
          transform: {
            request: (config: any) => {
              console.log(config.retry)
              console.log('request')
              return config
            },
            error: (error) => {
              error.config.retry = 5
              error.config.url = '/retry1'
              console.log('error========================')
              return error
            },
          },
        },
      ],
    })
    transforms.applyTransform(myAxios, addInterceptorsOptions)
    return {transforms, mock, myAxios, expectData, response, requestParam, request, expectResponse}
  }

  // describe('applyTransform', function test() {
  //   it('should run', async function test() {
  //     const {
  //       mock, myAxios, request, expectResponse, requestParam,
  //       expectData, response,
  //     } = newTest()
  //
  //     const accessToken = 'access-token'
  //
  //     {
  //       mock.onGet('/bizs/').reply(200, response)
  //       const result = await myAxios({...request, method: 'get', headers: {accessToken}})
  //       expect(mock.history.get).to.length(1)
  //       expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(expectData)
  //       expect(mock.history.get[0].headers.token).to.equal(accessToken)
  //       expect(result.data).to.deep.equal(expectResponse)
  //       mock.resetHistory()
  //     }
  //
  //     // get
  //     {
  //       mock.onGet('/bizs/').reply(200, response)
  //       const result = await myAxios({...requestParam, method: 'get'})
  //       expect(mock.history.get).to.length(1)
  //       expect(mock.history.get[0].params).to.deep.equal(expectData)
  //       expect(result.data).to.deep.equal(expectResponse)
  //       mock.resetHistory()
  //     }
  //
  //     // // post
  //     {
  //       mock.onPost('/bizs/').reply(200, response)
  //       const result = await myAxios({...request, method: 'post'})
  //       expect(mock.history.post).to.length(1)
  //       expect(JSON.parse(mock.history.post[0].data)).to.deep.equal(expectData)
  //       expect(result.data).to.deep.equal(expectResponse)
  //       mock.resetHistory()
  //     }
  //
  //     // patch
  //     {
  //       mock.onPatch('/bizs/').reply(200, response)
  //       const result = await myAxios({...request, method: 'patch'})
  //       expect(mock.history.patch).to.length(1)
  //       expect(JSON.parse(mock.history.patch[0].data)).to.deep.equal(expectData)
  //       expect(result.data).to.deep.equal(expectResponse)
  //       mock.resetHistory()
  //     }
  //
  //     // put
  //     {
  //       mock.onPut('/bizs/').reply(200, response)
  //       const result = await myAxios({...request, method: 'put'})
  //       expect(mock.history.put).to.length(1)
  //       expect(JSON.parse(mock.history.put[0].data)).to.deep.equal(expectData)
  //       expect(result.data).to.deep.equal(expectResponse)
  //       mock.resetHistory()
  //     }
  //
  //     // delete
  //     {
  //       mock.onDelete('/bizs/').reply(200, response)
  //       const result = await myAxios({...request, method: 'delete'})
  //       expect(mock.history.delete).to.length(1)
  //       expect(JSON.parse(mock.history.delete[0].data)).to.deep.equal(expectData)
  //       expect(result.data).to.deep.equal(expectResponse)
  //       mock.resetHistory()
  //     }
  //   })
  //   it('should run with first', async function test() {
  //     const {mock, myAxios} = newTest({
  //       first: {
  //         request: (payload) => {
  //           payload.data.first = true
  //           return payload
  //         },
  //         response: (data) => {
  //           data.test = true
  //           return data
  //         },
  //       },
  //     })
  //     const accessToken = 'access-token'
  //     mock.onPost('/any/').reply((config) => {
  //       return [200, JSON.parse(config.data)]
  //     })
  //     const result = await myAxios({
  //       url: '/any/', data: {}, method: 'post', headers: {accessToken},
  //     })
  //     expect(result.data.test).to.equal(true)
  //     expect(result.data.first).to.equal(true)
  //   })
  //
  //   it('should run with context', async function test() {
  //     const {mock, myAxios} = newTest()
  //     mock.onGet('/context/').reply((config) => {
  //       const data = JSON.parse(config.data)
  //       return [200, {
  //         ...data,
  //       }]
  //     })
  //
  //     const result = await myAxios({url: '/context/', method: 'get'})
  //     expect(result.data.contextRequest).to.equal('context')
  //     expect(result.data.contextResponse).to.equal('context')
  //
  //     const contextElseTest = axios.create()
  //     const transforms = new Transforms({
  //       matchers: [
  //         {
  //           test: /^\/test\/?/,
  //           transform: {
  //             response: (data) => (data),
  //           },
  //         },
  //       ],
  //     })
  //     transforms.applyTransform(contextElseTest)
  //     const resultData = {
  //       foo: 'foo',
  //     }
  //     const mock2 = new MockAdapter(contextElseTest)
  //     mock2.onGet('/test/').reply(() => ([200, resultData]))
  //     const result2 = await contextElseTest({
  //       url: '/test/',
  //       data: {
  //         foo: 'foo',
  //       },
  //     })
  //     expect(result2.data).to.deep.equal(resultData)
  //   })
  //
  //   it('should run with final', async function test() {
  //     const {
  //       mock, myAxios, request, response,
  //     } = newTest({
  //       final: {
  //         response: (data) => {
  //           data.result.test = true
  //           return data
  //         },
  //       },
  //     })
  //     const accessToken = 'access-token'
  //     mock.onGet('/bizs/').reply(200, response)
  //     const result = await myAxios({...request, method: 'get', headers: {accessToken}})
  //     expect(result.data.result.test).to.equal(true)
  //   })
  //
  //   it('should run with method', async function test() {
  //     const {
  //       mock, myAxios, response, expectResponse, expectData,
  //       request,
  //     } = newTest()
  //
  //     mock.onGet('/foos/').reply(200, response)
  //     const result = await myAxios({...request, url: '/foos/', method: 'get'})
  //     expect(mock.history.get).to.length(1)
  //     expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(expectData)
  //     expect(result.data).to.deep.equal(expectResponse)
  //     mock.resetHistory()
  //   })
  //   it('should run without matching', async function test() {
  //     const {
  //       mock, myAxios, response,
  //       request,
  //     } = newTest({}, {
  //       margeResponse: 'back',
  //     })
  //
  //     const accessToken = 'access-token'
  //
  //     // get
  //     {
  //       mock.onGet('/users/').reply(200, response)
  //       const result = await myAxios({
  //         ...request, url: '/users/', method: 'get', headers: {accessToken},
  //       })
  //       expect(mock.history.get).to.length(1)
  //       expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(request.data)
  //       expect(mock.history.get[0].headers.accessToken).to.equal(accessToken)
  //       expect(result.data).to.deep.equal(response)
  //       mock.resetHistory()
  //     }
  //   })
  //   it('should run with the back margeResponse options', async function test() {
  //     const {
  //       mock, myAxios, response, expectData,
  //       request, expectResponse,
  //     } = newTest({}, {
  //       margeResponse: 'back',
  //     })
  //
  //     // get
  //     {
  //       mock.onGet('/bizs/').reply(200, response)
  //       const result = await myAxios({...request, method: 'get'})
  //       expect(mock.history.get).to.length(1)
  //       expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(expectData)
  //       expect(result.data).to.deep.equal(expectResponse)
  //       mock.resetHistory()
  //     }
  //   })
  //   it('should run with the front margeResponse options', async function test() {
  //     const {
  //       mock, myAxios, response, expectData,
  //       request, expectResponse,
  //     } = newTest({}, {
  //       margeResponse: 'front',
  //     })
  //
  //     // get
  //     {
  //       mock.onGet('/bizs/').reply(200, response)
  //       const result = await myAxios({...request, method: 'get'})
  //       expect(mock.history.get).to.length(1)
  //       expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(expectData)
  //       expect(result.data).to.deep.equal(expectResponse)
  //       mock.resetHistory()
  //     }
  //   })
  // })
  //
  // describe('confirmTransforms', function test() {
  //   it('should return confirmTransSet', function test() {
  //     {
  //       const result = confirmTransforms()
  //       expect(result.response).to.be.an('array')
  //       expect(result.request).to.be.an('array')
  //     }
  //     {
  //       const result = confirmTransforms({
  //         response: [],
  //       })
  //       expect(result.response).to.be.an('array')
  //       expect(result.request).to.be.an('array')
  //     }
  //     {
  //       const result = confirmTransforms({
  //         request: [],
  //       })
  //       expect(result.response).to.be.an('array')
  //       expect(result.request).to.be.an('array')
  //     }
  //     {
  //       const result = confirmTransforms({
  //         request: (payload) => (payload),
  //         response: (payload) => (payload),
  //       })
  //       expect(result.response).to.be.an('array')
  //       expect(result.request).to.be.an('array')
  //     }
  //   })
  // })

  describe('error', function test() {
    it('should handle', async function test() {
      const {
        mock, myAxios,
      } = newTest()

      const accessToken = 'access-token'
      let error

      const errorData = {
        _code: 'my-code',
        _message: 'my-message',
      }

      mock.onPost('/retry').reply(401, {
        code: 'my-code',
        message: 'my-message',
      })
      mock.onPost('/retry1').reply(200, {
        code: 'my-code',
        message: 'my-message',
      })
      try {
        await myAxios({url: '/retry', method: 'post', headers: {accessToken}})
      } catch(e) {
        console.log(e)
        error = e
        const {data} = e.response
        expect(e.response.status).to.equal(401)
        expect(data.code).to.equal(errorData._code)
        expect(data.message).to.equal(errorData._message)
      }
      expect(error).to.instanceOf(Error)
      mock.resetHistory()
    })
  })

  // describe('get matchers', function test() {
  //   it('should return array', () => {
  //     const transforms = new Transforms({})
  //     expect(transforms.matchers).to.be.an('array')
  //   })
  // })
})
