import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const mcpToken = sdk.Action.withoutInput(
  'mcp-token',

  async () => ({
    name: i18n('Set MCP Token'),
    description: i18n(
      'Generate a new bearer token for the MCP interface. Replaces the current one.',
    ),
    warning: i18n(
      'Replaces the current MCP token. Every assistant configured with it stops authenticating until it is updated.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const token = utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 64 })

    await storeJson.merge(effects, { mcpToken: token })

    return {
      version: '1' as const,
      title: i18n('MCP Token'),
      message: i18n(
        'Send this as `Authorization: Bearer <token>` to the MCP interface. Anyone holding it can query this node.',
      ),
      result: {
        type: 'single' as const,
        name: i18n('MCP Token'),
        description: null,
        value: token,
        copyable: true,
        qr: false,
        masked: true,
      },
    }
  },
)
