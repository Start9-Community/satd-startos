import { createHmac } from 'crypto'
import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { rpcUsername } from '../utils'

export const rpcCredentials = sdk.Action.withoutInput(
  'rpc-credentials',

  async ({ effects }) => ({
    name: i18n('Set RPC Credentials'),
    description: i18n(
      'Generate a new password for the RPC interface. Replaces any existing one.',
    ),
    warning: (await storeJson.read((s) => s.rpcAuth).const(effects))
      ? i18n(
          'Replaces the current RPC password. Every client configured with it stops authenticating until it is updated.',
        )
      : null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const password = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })
    const salt = utils.getDefaultString({ charset: 'a-f,0-9', len: 32 })
    const hmac = createHmac('sha256', salt).update(password).digest('hex')

    await storeJson.merge(effects, {
      rpcAuth: `${rpcUsername}:${salt}$${hmac}`,
    })

    return {
      version: '1' as const,
      title: i18n('RPC Credentials'),
      message: i18n(
        'Use these with any Bitcoin Core-compatible client on the RPC interface. The password is not kept anywhere; run this action again to replace it.',
      ),
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: i18n('Username'),
            description: null,
            value: rpcUsername,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single' as const,
            name: i18n('Password'),
            description: null,
            value: password,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
