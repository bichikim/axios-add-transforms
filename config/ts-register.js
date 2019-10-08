/* tslint:disable:no-require-imports */
/* istanbul ignore file no way to test*/
const tsNode = require('ts-node')
tsNode.register({
  project: 'tsconfig.node.json',
  transpileOnly: true,
})
