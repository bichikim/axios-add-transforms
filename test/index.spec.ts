import axios, {Method} from 'axios'
import MockAdapter from 'axios-mock-adapter'
import Transforms, {TransformsOptions} from '../src/index'

describe('lib/transforms', function test() {
  const newTest = (options: TransformsOptions = {}) => {
    const mock = new MockAdapter(axios)
    const {final = {}, matchers = [], first} = options
    const finalRequest = (final.request || []) as any[]
    const finalResponse = (final.response || []) as any[]
    const transforms = new Transforms({
      first,
      final: {
        request: [...finalRequest, (data) => (JSON.stringify(data))],
        response: finalResponse,
      },
      matchers: [
        ...matchers,
        {
          test: /^\/bizs\//,
          transform: {
            request: ({foo, bar}) => ({
              '_foo': foo,
              '_bar': bar,
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
    return {transforms, mock}
  }

  describe('addTransforms', function test() {
    it('should run', async function test() {
      const {transforms, mock} = newTest()
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
        const result = await axios(transforms.addTransforms({...request, method: 'get'}))
        expect(mock.history.get).to.length(1)
        expect(JSON.parse(mock.history.get[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }

      // post
      {
        mock.onPost('/bizs/').reply(200, response)
        const result = await axios(transforms.addTransforms({...request, method: 'post'}))
        expect(mock.history.post).to.length(1)
        expect(JSON.parse(mock.history.post[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }

      // patch
      {
        mock.onPatch('/bizs/').reply(200, response)
        const result = await axios(transforms.addTransforms({...request, method: 'patch'}))
        expect(mock.history.patch).to.length(1)
        expect(JSON.parse(mock.history.patch[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }

      // put
      {
        mock.onPut('/bizs/').reply(200, response)
        const result = await axios(transforms.addTransforms({...request, method: 'put'}))
        expect(mock.history.put).to.length(1)
        expect(JSON.parse(mock.history.put[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }

      // delete
      {
        mock.onDelete('/bizs/').reply(200, response)
        const result = await axios(transforms.addTransforms({...request, method: 'delete'}))
        expect(mock.history.delete).to.length(1)
        expect(JSON.parse(mock.history.delete[0].data)).to.deep.equal(expectData)
        expect(result.data).to.deep.equal(expectResponse)
        mock.resetHistory()
      }
    })

    it('should run without matchers', async function test() {
      const request = {url: '/bizs/'}

      const transforms = new Transforms({
        final: {
          request: (data) => (JSON.stringify(data)),
        },
      })
      const mock = new MockAdapter(axios)
      mock.onGet('/bizs/').reply(200)
      const result = await axios(transforms.addTransforms({...request}))
      expect(mock.history.get).length(1)
      expect(result).to.be.an('object')
    })

    it('should run with a matched method matcher', async function test() {
      const method: Method = 'get'
      const request = {
        url: '/bizs/', method, data: {
          foo: 'foo',
          bar: 'bar',
        },
      }

      const transforms = new Transforms({
        final: {
          request: (data) => (JSON.stringify(data)),
        },
        matchers: [
          {
            test: /^\/bizs\//,
            method: 'get',
            transform: {
              request: ({foo, bar}) => ({'_foo': foo, '_bar': bar}),
            },
          },
        ],
      })
      const mock = new MockAdapter(axios)
      mock.onGet('/bizs/').reply(200)
      const result = await axios(transforms.addTransforms({...request}))
      expect(mock.history.get).length(1)
      expect(JSON.parse(mock.history.get[0].data)).to.deep.equal({
        '_foo': 'foo',
        '_bar': 'bar',
      })
      expect(result).to.be.an('object')
    })

    it('should run without a matched matcher', async function test() {
      const method: Method = 'get'
      const request = {
        url: '/bizs/', method, data: {
          foo: 'foo',
          bar: 'bar',
        },
      }

      const transforms = new Transforms({
        final: {
          request: (data) => (JSON.stringify(data)),
        },
        matchers: [
          {
            test: /^\/bizs\//,
            method: 'post',
            transform: {
              request: ({foo, bar}) => ({'_foo': foo, '_bar': bar}),
            },
          },
        ],
      })
      const mock = new MockAdapter(axios)
      mock.onGet('/bizs/').reply(200)
      const result = await axios(transforms.addTransforms({...request}))
      expect(mock.history.get).length(1)
      expect(JSON.parse(mock.history.get[0].data)).to.deep.equal({
        'foo': 'foo',
        'bar': 'bar',
      })
      expect(result).to.be.an('object')
    })

    it('should run with first transforms', async function test() {
      const {transforms, mock} = newTest({
        first: {
          request: ({'$foo': foo, '$bar': bar}) => ({bar, foo}),
        },
      })

      const request = {
        url: '/bizs/', data: {
          '$foo': 'foo',
          '$bar': 'bar',
        },
      }

      const response = {
        result: {
          '_id': 1,
          '_name': 'foo',
        },
      }

      mock.onGet('/bizs/').reply(200, response)
      const result = await axios(transforms.addTransforms({...request, method: 'get'}))
      expect(mock.history.get).length(1)
      expect(JSON.parse(mock.history.get[0].data)).to.deep.equal({
        '_foo': 'foo',
        '_bar': 'bar',
      })
      expect(result).to.be.an('object')
    })
  })

})
