import Transforms, {TransformerRequest, TransformerResponse, TransformSetArray} from '@/index'

{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const transforms = new Transforms()
  Transforms.mergeArray([], '')
  Transforms.mergeArray(null, [])
  Transforms.confirmTransforms({})
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const transformer: TransformerRequest = (payload, context) => {
    const baseURL = payload.baseURL
    return {
      baseURL,
      url: context.url,
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const transformerResponse: TransformerResponse = (data, context) => {
    const anyData = data.any
    if(anyData) {
      return false
    }
    if(data) {
      return []
    }
    return context
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const transformSetArray: TransformSetArray = {
    request: [(data) => (`${data}any`)],
    response: [],
  }
}

{
  interface Context {
    url: string
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const transforms = new Transforms({})
  const context: Context = {
    url: '/foo',
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const transformer: TransformerRequest<Context> = (payload, context) => {
    const baseURL = payload.baseURL
    return {
      baseURL,
      url: context.url,
    }
  }
}
