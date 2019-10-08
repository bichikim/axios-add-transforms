import {chain, forEach} from 'lodash'

const createDefinitions = <E>(
  env: { [key: string]: any },
  addPrefix: boolean = false,
): E => {
  const stringifyEnv: any = {}
  const prefix = addPrefix ? 'process.env.' : ''
  forEach(env, (value, key) => {
    const name = chain(key).snakeCase().toUpper().value()
    stringifyEnv[`${prefix}${name}`] = JSON.stringify(value)
  })
  return stringifyEnv
}

export default createDefinitions
