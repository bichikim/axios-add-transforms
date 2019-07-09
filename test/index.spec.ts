import axios, {AxiosInstance} from 'axios'
import MockAdapter from 'axios-mock-adapter'
import Transforms, {TransformsOptions} from '../src/index'

describe('lib/transforms', function test() {
  const newTest = (options: TransformsOptions = {}, _axios?: AxiosInstance ) => {
    const myAxios = axios.create()
    const mock = new MockAdapter(myAxios)
    const {final = {}, matchers = [], first} = options
    const finalRequest = (final.request || []) as any[]
    const finalResponse = (final.response || []) as any[]
    const transforms = new Transforms({
      first,
      final: {
        request: finalRequest,
        response: finalResponse,
      },
      matchers: [
        ...matchers,
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
      ],
    })
    transforms.addInterceptors(myAxios)
    return {transforms, mock, myAxios}
  }

  describe('addInterceptors', function test() {
    it('should run', async function test() {
      const {transforms, mock, myAxios} = newTest()
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

      // get
      {
        mock.onGet('/bizs/').reply(200, response)
        const result = await myAxios({...request, method: 'get'})
        expect(mock.history.get).to.length(1)
        expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(expectData)
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
      const myAxios = axios.create()
      const mock = new MockAdapter(myAxios)
      const transforms = new Transforms({
        matchers: [
          {
            test: /^\/bizs\//,
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
      transforms.addInterceptors(myAxios)

      const data = {
        foo: 'foo',
        bar: 'bar',
      }
      const request = {
        url: '/bizs/',
        data,
      }

      const response = {
        result: {
          '_id': 1,
          '_name': 'foo',
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

      {
        mock.onGet('/bizs/').reply(200, response)
        const result = await myAxios({...request, method: 'get'})
        expect(mock.history.get).to.length(1)
        expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }
      // no matcher
      {
        mock.onPost('/bizs/').reply(200, response)
        const result = await myAxios({...request, method: 'post'})
        expect(mock.history.post).to.length(1)
        expect(JSON.parse(mock.history.post[0].data)).to.deep.equal(data)
        expect(result.data).to.deep.equal(response)
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
})
