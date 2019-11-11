import Transforms, {TransformsOptions} from '@/index'
import axios, {AxiosInstance} from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('lib/transforms', function test() {
  const newTest = (
    options: TransformsOptions = {},
    margeResponse?: any,
  ) => {
    const myAxios = axios.create()
    const context = {axios: myAxios, test: 'context'}
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
    const transforms = new Transforms<{ axios: AxiosInstance }>({
      first,
      final,
      context: () => (context),
      margeResponse,
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
                contextRequest: context.test,
              },
            }),
            response: (data, context) => ({
              ...data,
              contextResponse: context.test,
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
          test: /^\/retry-request$/,
          method: 'post',
          transform: {
            error: [async (error, context) => {
              error.config.url = '/test'
              try {
                error.response = await context.axios({
                  url: 'retry',
                  method: 'post',
                })
                error.isError = false
                return error
              } catch(e) {
                return e
              }
            }],
          },
        },
        {
          test: /^\/retry-next$/,
          method: 'post',
          transform: {
            error: (error) => {

              error.config.data = {pass: true}
              error.retry = true
              return error
            },
            response: () => {
              return {
                response: true,
              }
            },
          },
        },
        {
          test: /^\/retry-change$/,
          method: 'post',
          transform: {
            request(payload) {
              payload.url = '/retry-change-new'
              return payload
            },
            error: (error) => {
              error.config.url = '/retry-change2'
              error.retry = true
              return error
            },
          },
        },
      ],
    })
    transforms.applyTransform(myAxios)
    return {
      context,
      transforms, mock, myAxios, expectData, response, requestParam, request, expectResponse,
    }
  }

  describe('applyTransform', function test() {
    it('should run', async function test() {
      const {
        mock, myAxios, request, expectResponse, requestParam,
        expectData, response,
      } = newTest()

      const accessToken = 'access-token'

      {
        mock.onGet('/bizs/').reply(200, response)
        const result = await myAxios({...request, method: 'get', headers: {accessToken}})
        expect(mock.history.get).to.length(1)
        expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(expectData)
        expect(mock.history.get[0].headers.token).to.equal(accessToken)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }

      // get
      {
        mock.onGet('/bizs/').reply(200, response)
        const result = await myAxios({...requestParam, method: 'get'})
        expect(mock.history.get).to.length(1)
        expect(mock.history.get[0].params).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }

      // // post
      {
        mock.onPost('/bizs/').reply(200, response)
        const result = await myAxios({...request, method: 'post'})
        expect(mock.history.post).to.length(1)
        expect(JSON.parse(mock.history.post[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }

      // patch
      {
        mock.onPatch('/bizs/').reply(200, response)
        const result = await myAxios({...request, method: 'patch'})
        expect(mock.history.patch).to.length(1)
        expect(JSON.parse(mock.history.patch[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }

      // put
      {
        mock.onPut('/bizs/').reply(200, response)
        const result = await myAxios({...request, method: 'put'})
        expect(mock.history.put).to.length(1)
        expect(JSON.parse(mock.history.put[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }

      // delete
      {
        mock.onDelete('/bizs/').reply(200, response)
        const result = await myAxios({...request, method: 'delete'})
        expect(mock.history.delete).to.length(1)
        expect(JSON.parse(mock.history.delete[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }
    })
    it('should run with first', async function test() {
      const {mock, myAxios} = newTest({
        first: {
          request: (payload) => {
            payload.data.first = true
            return payload
          },
          response: (data) => {
            data.test = true
            return data
          },
        },
      })
      const accessToken = 'access-token'
      mock.onPost('/any/').reply((config) => {
        return [200, JSON.parse(config.data)]
      })
      const result = await myAxios({
        url: '/any/', data: {}, method: 'post', headers: {accessToken},
      })
      expect(result.data.test).to.equal(true)
      expect(result.data.first).to.equal(true)
    })

    it('should run with context', async function test() {
      const {mock, myAxios, context} = newTest()
      mock.onGet('/context/').reply((config) => {
        const data = JSON.parse(config.data)
        return [200, {
          ...data,
        }]
      })

      const result = await myAxios({url: '/context/', method: 'get'})
      expect(result.data.contextRequest).to.equal('context')
      expect(result.data.contextResponse).to.equal('context')

      const contextElseTest = axios.create()
      const transforms = new Transforms({
        matchers: [
          {
            test: /^\/test\/?/,
            transform: {
              response: (data) => (data),
            },
          },
        ],
      })
      transforms.applyTransform(contextElseTest)
      const resultData = {
        foo: 'foo',
      }
      const mock2 = new MockAdapter(contextElseTest)
      mock2.onGet('/test/').reply(() => ([200, resultData]))
      const result2 = await contextElseTest({
        url: '/test/',
        data: {
          foo: 'foo',
        },
      })
      expect(result2.data).to.deep.equal(resultData)
    })

    it('should run with final', async function test() {
      const {
        mock, myAxios, request, response,
      } = newTest({
        final: {
          response: (data) => {
            data.result.test = true
            return data
          },
        },
      })
      const accessToken = 'access-token'
      mock.onGet('/bizs/').reply(200, response)
      const result = await myAxios({...request, method: 'get', headers: {accessToken}})
      expect(result.data.result.test).to.equal(true)
    })

    it('should run with method', async function test() {
      const {
        mock, myAxios, response, expectResponse, expectData,
        request,
      } = newTest()

      mock.onGet('/foos/').reply(200, response)
      const result = await myAxios({...request, url: '/foos/', method: 'get'})
      expect(mock.history.get).to.length(1)
      expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(expectData)
      expect(result.data).to.deep.equal(expectResponse)
      mock.resetHistory()
    })
    it('should run without matching', async function test() {
      const {
        mock, myAxios, response,
        request,
      } = newTest({}, {
        margeResponse: 'back',
      })

      const accessToken = 'access-token'

      // get
      {
        mock.onGet('/users/').reply(200, response)
        const result = await myAxios({
          ...request, url: '/users/', method: 'get', headers: {accessToken},
        })
        expect(mock.history.get).to.length(1)
        expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(request.data)
        expect(mock.history.get[0].headers.accessToken).to.equal(accessToken)
        expect(result.data).to.deep.equal(response)
        mock.resetHistory()
      }
    })
    it('should run with the back margeResponse options', async function test() {
      const {
        mock, myAxios, response, expectData,
        request, expectResponse,
      } = newTest({}, {
        margeResponse: 'back',
      })

      // get
      {
        mock.onGet('/bizs/').reply(200, response)
        const result = await myAxios({...request, method: 'get'})
        expect(mock.history.get).to.length(1)
        expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }
    })
    it('should run with the front margeResponse options', async function test() {
      const {
        mock, myAxios, response, expectData,
        request, expectResponse,
      } = newTest({}, 'front')

      // get
      {
        mock.onGet('/bizs/').reply(200, response)
        const result = await myAxios({...request, method: 'get'})
        expect(mock.history.get).to.length(1)
        expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }
    })
  })

  describe('error', function test() {
    it('should handle response', async function test() {
      const {
        mock, myAxios,
      } = newTest()
      mock.onPost('/retry').reply(200, {
        code: 'my-code',
        message: 'my-message',
      })
      mock.onPost('/retry-request').reply(400, {
        code: 'my-code',
        message: 'my-message',
      })

      const result = await myAxios({url: '/retry-request', method: 'post'})
      expect(result.data.code).to.equal('my-code')
      expect(result.data.message).to.equal('my-message')
    })
    it('should retry', async function test() {
      const {
        mock, myAxios,
      } = newTest()
      mock.onPost('/retry-next').reply((config) => {
        const data = config.data
        if(data && data.pass) {
          return [200]
        }
        return [401]
      })
      const result = await myAxios({
        url: '/retry-next',
        method: 'post',
      })
      expect(result.data.response).to.equal(true)
    })
    it('should retry in same matcher', async function test() {
      const {
        mock, myAxios,
      } = newTest()
      mock.onPost('/retry-change-new').reply(() => {
        return [401, {}]
      })
      mock.onPost('/retry-change2').reply(() => {
        return [200, {response: true}]
      })
      const result = await myAxios({
        url: '/retry-change',
        method: 'post',
      })

      expect(result.data.response).to.equal(true)
    })
  })

  describe('get members', function test() {
    it('should return array', () => {
      const transforms = new Transforms()
      expect(transforms.matchers).to.be.an('array')
      expect(transforms.context).to.be.an('object')
    })
  })

  describe('applyTransform', function test() {
    it('should not add interceptors twice', function test() {
      const myAxios = axios.create({})
      const transforms = new Transforms()
      const result1 = transforms.applyTransform(myAxios)
      const result2 = transforms.applyTransform(myAxios)
      expect(result1).to.equal(result2)
    })
  })

  describe('ejectTransform', function test() {
    it('should eject interceptors', function test() {
      const myAxios = axios.create({})
      const transforms = new Transforms({
        matchers: [
          {
            test: /^\/test/,
            method: 'get',
            transform: {
              request: (payload) => (payload),
              response: (data) => (data),
              error: (error) => (error),
            },
          },
        ],
      })
      transforms.applyTransform(myAxios)
      const request: any = myAxios.interceptors.request
      const response: any = myAxios.interceptors.response
      expect(request.handlers[0]).to.be.an('object')
      expect(response.handlers[0]).to.be.an('object')
      transforms.ejectTransform(myAxios)
      expect(request.handlers[0]).to.be.an('null')
      expect(response.handlers[0]).to.be.an('null')
      transforms.ejectTransform(myAxios)
    })
  })

  describe('addInterceptors', function test() {
    it('should add interceptors', function test() {
      const myAxios = axios.create({})
      const transforms = new Transforms({
        matchers: [
          {
            test: /^\/test/,
            method: 'get',
            transform: {
              request: (payload) => (payload),
              response: (data) => (data),
              error: (error) => (error),
            },
          },
        ],
      })
      const _axios = transforms.addInterceptors(myAxios)
      const request: any = myAxios.interceptors.request
      const response: any = myAxios.interceptors.response
      expect(_axios).to.equal(myAxios)
      expect(request.handlers[0]).to.be.an('object')
      expect(response.handlers[0]).to.be.an('object')
    })
  })
})
