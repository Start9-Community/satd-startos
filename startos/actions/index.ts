import { sdk } from '../sdk'
import { caCertificate } from './caCertificate'
import { mcpHostnames } from './mcpHostnames'
import { mcpToken } from './mcpToken'
import { network } from './network'
import { rpcCredentials } from './rpcCredentials'

export const actions = sdk.Actions.of()
  .addAction(network)
  .addAction(rpcCredentials)
  .addAction(mcpToken)
  .addAction(mcpHostnames)
  .addAction(caCertificate)
