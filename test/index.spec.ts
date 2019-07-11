import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import Transforms, {AddInterceptorsOptions, TransformsOptions} from '../src/index'

describe('lib/transforms', function test() {
  const newTest = (
    options: TransformsOptions = {},
    addInterceptorsOptions?: AddInterceptorsOptions,
  ) => {
    const myAxios = axios.create()
    const mock = new MockAdapter(myAxios)
    const {final = {}, matchers = [], first} = options
    const finalRequest = (final.request || []) as any[]
    const finalResponse = (final.response || []) as any[]
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
      final: {
        request: finalRequest,
        response: finalResponse,
      },
      matchers: [
        ...matchers,
        {
          test: /^\.*/,
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
            request: ({data, headers, params}) => ({
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
            response: ({result: {'_id': id, '_name': name}}) => ({
              result: {
                id, name,
              },
            }),
          },
        },
        {
          test: /^\/foos\//,
          method: 'get',
          transform: {
            request: ({data, headers, params}) => ({
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
            response: ({result: {'_id': id, '_name': name}}) => ({
              result: {
                id, name,
              },
            }),
          },
        },
      ],
    })
    transforms.addInterceptors(myAxios, addInterceptorsOptions)
    return {transforms, mock, myAxios, expectData, response, requestParam, request, expectResponse}
  }

  describe('addInterceptors', function test() {
    it('should run', async function test() {
      const {
        mock, myAxios, request, expectResponse, requestParam,
        expectData, response,
      } = newTest()

      const accessToken = 'access-token'

      // get
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

      // get
      {
        mock.onGet('/users/').reply(200, response)
        const result = await myAxios({...request, url: '/users/', method: 'get'})
        expect(mock.history.get).to.length(1)
        expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(request.data)
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
      } = newTest({}, {
        margeResponse: 'front',
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
  })

  describe('confirmTransforms', function test() {
    it('should return confirmTransSet', function test() {
      const {confirmTransforms} = Transforms
      {
        const result = confirmTransforms()
        expect(result.response).to.be.an('array')
        expect(result.request).to.be.an('array')
      }
      {
        const result = confirmTransforms({
          response: [],
        })
        expect(result.response).to.be.an('array')
        expect(result.request).to.be.an('array')
      }
      {
        const result = confirmTransforms({
          request: [],
        })
        expect(result.response).to.be.an('array')
        expect(result.request).to.be.an('array')
      }
    })
  })

  describe('margeArray', function test() {
    it('should marge any two values as an array', function test() {
      const {mergeArray} = Transforms
      {
        const result = mergeArray(null, null)
        expect(result).to.deep.equal([])
      }
      {
        const result = mergeArray(['a'], ['b'])
        expect(result).to.deep.equal(['a', 'b'])
      }
      {
        const result = mergeArray('a', 'b')
        expect(result).to.deep.equal(['a', 'b'])
      }
    })
  })

  describe('get matchers', function test() {
    it('should return array', () => {
      const transforms = new Transforms({})
      expect(transforms.matchers).to.be.an('array')
    })
  })
})
