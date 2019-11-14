import Transforms, {TransformsOptions} from '@/index'
import {getInfo} from '@/utils'

import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const newTest = (options: TransformsOptions) => {
  const axios = Axios.create({})
  const mock = new MockAdapter(axios)
  const transforms = new Transforms(options)
  transforms.applyTransform(axios)
  return {
    axios, mock, transforms,
  }
}

describe('lib/transforms', function test() {

  describe('request & response', function test() {
    it('should run', async function test() {
      const testTransform = (identifier) => ({
        request: (config, context) => {
          if(!config.data) {
            config.data = {}
          }
          if(context) {
            config.data.request = identifier
          }
          return config
        },
        response: (data, context, config) => {
          if(typeof data === 'object' && context && config) {
            data.response = identifier
          }
          return data
        },
      })
      const {mock, axios} = newTest({
        first: {
          request: (config, context) => {
            if(!config.data) {
              config.data = {}
            }
            if(context) {
              config.data.firstRequest = true
            }
            return config
          },
          response: (data, context, config) => {
            if(typeof data === 'object' && context && config) {
              data.firstResponse = true
            }
            return data
          },
        },
        matchers: [
          {
            test: /^\/foo\/?$/,
            method: 'post',
            transform: testTransform(true),
          },
          {
            test: /^\/foo\/([0-9])+\/?$/,
            method: 'all',
            transform: {
              request: [testTransform('number').request],
              response: [testTransform('number').response],
            },
          },
        ],
        final: {
          request: (payload, context) => {
            if(!payload.data) {
              payload.data = {}
            }
            if(context) {
              payload.data.finalRequest = true
            }

            return payload
          },
          response: (data, context, config) => {
            if(typeof data === 'object' && context && config) {
              data.finalResponse = true
            }
            return data
          },
        },
      })
      const reply = (config) => {
        const {data: _data} = config
        let data = _data
        try {
          data = JSON.parse(_data)
        } catch(e) {
          // skip
        }
        return [200, data]
      }
      mock.onPost('/foo').reply(reply)
      mock.onPost('/foo/001').reply(reply)
      {
        const result = await axios({
          url: '/foo',
          method: 'post',
        })
        const {data} = result
        expect(data.request).to.equal(true)
        expect(data.response).to.equal(true)
        expect(data.finalRequest).to.equal(true)
        expect(data.finalResponse).to.equal(true)
        expect(data.firstRequest).to.equal(true)
        expect(data.firstResponse).to.equal(true)
      }
      {
        const result = await axios({
          url: '/foo/001',
          method: 'post',
        })
        const {data} = result
        expect(data.request).to.equal('number')
        expect(data.response).to.equal('number')
        expect(data.finalRequest).to.equal(true)
        expect(data.finalResponse).to.equal(true)
        expect(data.firstRequest).to.equal(true)
        expect(data.firstResponse).to.equal(true)
      }
    })

    it('should keep matcher', async function test() {
      let pass = 0
      const {axios, mock} = newTest({
        matchers: [
          {
            test: /^\/foo/,
            method: 'post', // testing all
            transform: {
              request: [(config) => {
                config.url = '/foo-redirect'
                config.method = 'patch'
                return config
              },
                (config) => (Promise.resolve(config)),
              ],
              response: (data) => {
                data.response = pass
                return data
              },
              error: (error) => {
                error.retry = pass < 1
                pass += 1
                return error
              },
            },
          },
        ],
      })
      mock.onPatch('/foo-redirect').reply(() => {
        return [pass > 0 ? 200 : 401, {}]
      })
      const result = await axios({
        url: '/foo',
        method: 'post',
      })
      const {data} = result
      expect(data.response).to.equal(1)
      expect(pass).to.equal(1)
    })

    it('should run with empty request', async function test() {
      const {axios, mock} = newTest({
        matchers: [
          {
            test: /^\/?$/,
            transform: {
              request: [(config) => {
                config.url = '/foo'
                return config
              }],
            },
          },
        ],
      })
      mock.onGet('/foo').reply(200)
      const result = await axios({})
      expect(result).to.be.a('object')
    })

    it('should keep info', async function test() {
      const {axios, mock} = newTest({
        matchers: [
          {
            test: /^\/foo\/?$/,
            transform: {
              request: [(config) => {
                config.data = {
                  foo: config.info.foo,
                }
                return config
              }],
            },
          },
        ],
      })

      mock.onPost('/foo').reply((config) => {
        let data
        try {
          data = JSON.parse(config.data)
        } catch(e) {
          data = config.data
        }
        if(data && data.foo) {
          return [200, {}]
        }
        return [401]
      })
      const result = await axios({
        url: '/foo',
        method: 'post',
        info: {foo: true},
      })
      expect(result).to.be.a('object')
    })

    it('should keep function info', async function test() {
      const payload = {
        foo: false,
        bar: false,
      }
      const {axios, mock} = newTest({
        matchers: [
          {
            test: /^\/foo\/?$/,
            transform: {
              request: [(config) => {
                config.data = {}
                config.data.foo = config.info.foo
                config.data.bar = config.info.bar
                return config
              }],
            },
          },
        ],
      })
      mock.onPost('/foo').reply((config) => {
        let data
        try {
          data = JSON.parse(config.data)
        } catch(e) {
          data = config.data
        }
        if(data.foo && data.bar) {
          return [200, {}]
        }
        return [400]
      })
      payload.bar = true
      payload.foo = true
      const result = await axios({
        url: '/foo',
        method: 'post',
        info: () => ({
          foo: payload.foo,
          bar: payload.bar,
        }),
      })
      expect(result).to.be.a('object')
    })

    it('should margeResponse front', async function test() {
      const {axios, mock} = newTest({
        margeResponse: 'front',
        matchers: [
          {
            test: /^\/foo\/?/,
            transform: {
              response: (data) => {
                data.response = 'transformer'
                return data
              },
            },
          },
        ],
      })
      mock.onPost('/foo').reply(200, {})
      const result = await axios({
        url: '/foo',
        method: 'post',
        transformResponse: [
          (data) => {
            data.response = 'config'
            return data
          },
        ],
      })
      expect(result.data.response).to.equal('config')
    })
    it('should margeResponse back', async function test() {
      const {axios, mock} = newTest({
        margeResponse: 'back',
        matchers: [
          {
            test: /^\/foo\/?/,
            transform: {
              response: (data) => {
                data.response = 'transformer'
                return data
              },
            },
          },
        ],
      })
      mock.onPost('/foo').reply(200, {})
      const result = await axios({
        url: '/foo',
        method: 'post',
        transformResponse: [
          (data) => {
            data.response = 'config'
            return data
          },
        ],
      })
      expect(result.data.response).to.equal('transformer')
    })
  })

  describe('getInfo', function test() {
    it('should return undefined', function test() {
      const result = getInfo(undefined)
      expect(result).to.equal(undefined)
    })
  })

  describe('error', function test() {
    it('should pass internal error', async function test() {
      let errorInfo: null | boolean = null
      const {
        mock, axios,
      } = newTest({
        matchers: [
          {
            test: /^\/foo\/?/,
            method: 'all',
            transform: {
              response: () => {
                throw Error
              },
              error: (error) => {
                // will skip
                errorInfo = true
                return error
              },
            },
          },
        ],
      })
      mock.onPost('/foo').reply(200, {
        code: 'my-code',
        message: 'my-message',
      })

      let result
      try {
        result = await axios({url: '/foo', method: 'post'})
      } catch(e) {
        expect(e).to.be.a('function')
      }

      expect(result).to.equal(undefined)
      expect(errorInfo).to.equal(null)
    })
    it('should keep state', async function test() {
      let retry = 0
      const {
        mock, axios,
      } = newTest({
        matchers: [
          {
            test: /^\/foo\/?/,
            method: 'all',
            transform: {
              error: (error, context, status) => {
                retry += 1
                if(!status.retry) {
                  status.retry = 1
                } else {
                  status.retry += 1
                }
                error.retry = status.retry < 3
                return error
              },
            },
          },
        ],
      })
      mock.onPost('/foo').reply(() => {
        if(retry === 2) {
          return [200, {pass: true}]
        }
        return [401]
      })
      const result = await axios({
        url: '/foo',
        method: 'post',
      })
      expect(result.data.pass).to.equal(true)
      expect(retry).to.equal(2)
    })
    it('should throw axios error', async function test() {
      const {mock, axios} = newTest({
        matchers: [
          {
            test: /^\/foo\/?/,
            method: 'all',
            transform: {
              error: (error) => (error),
            },
          },
        ],
      })

      mock.onPost('/foo').reply(401)
      let result
      try {
        result = await axios({
          url: '/foo',
          method: 'post',
        })
      } catch(e) {
        expect(e).to.instanceOf(Error)
      }
      expect(result).to.equal(undefined)
    })
    it('should retry with changing', async function test() {
      let _error = true
      const {mock, axios} = newTest({
        matchers: [
          {
            test: /^\/foo\/?/,
            method: 'all',
            transform: {
              request: (payload) => {
                if(payload.data.pass) {
                  payload.url = '/bar'
                }
                return payload
              },
              error: (error) => {
                _error = false
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
        ],
      })

      mock.onPost('/bar').reply((config) => {
        let data
        try {
          data = JSON.parse(config.data)
        } catch(e) {
          data = config.data
        }
        if(!_error && data.pass) {
          return [200]
        }
        return [401]
      })
      const result = await axios({
        url: '/foo',
        method: 'post',
        data: {
          pass: true,
        },
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
      const myAxios = Axios.create({})
      const transforms = new Transforms()
      const result1 = transforms.applyTransform(myAxios)
      const result2 = transforms.applyTransform(myAxios)
      expect(result1).to.equal(result2)
    })
  })

  describe('ejectTransform', function test() {
    it('should eject interceptors', function test() {
      const {axios, transforms} = newTest({
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
      const request: any = axios.interceptors.request
      const response: any = axios.interceptors.response
      expect(request.handlers[0]).to.be.an('object')
      expect(response.handlers[0]).to.be.an('object')
      transforms.ejectTransform(axios)
      expect(request.handlers[0]).to.be.an('null')
      expect(response.handlers[0]).to.be.an('null')
      transforms.ejectTransform(axios)
    })
  })

  describe('addInterceptors', function test() {
    it('should add interceptors', function test() {
      const myAxios = Axios.create({})
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
