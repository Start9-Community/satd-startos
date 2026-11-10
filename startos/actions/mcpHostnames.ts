import { ISB } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// The OS proxy forwards the client's Host header unchanged, and satd answers
// 403 to any name outside its allowlist; nothing exposes the server's own
// names to the package, so the operator supplies them.
export const mcpHostnames = sdk.Action.withInput(
  'mcp-hostnames',

  async () => ({
    name: i18n('MCP Hostnames'),
    description: i18n('The names this server is reached by, for MCP clients'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  ISB.InputSpec.of({
    mcpHostnames: ISB.Value.text({
      name: i18n('Hostnames'),
      description: i18n(
        'The hostname you type in the address bar to reach this server, such as my-server.local. Separate several with commas. Add one for every name clients use — an address reached by a name not listed here is refused.',
      ),
      footnote: i18n(
        'MCP only. The other interfaces are unaffected by this setting.',
      ),
      placeholder: 'my-server.local',
      default: null,
      required: false,
      patterns: [
        {
          regex:
            '^[A-Za-z0-9.-]+(:[0-9]{1,5})?( *, *[A-Za-z0-9.-]+(:[0-9]{1,5})?)*$',
          description: i18n(
            'A hostname, or hostname:port, separated by commas. Not a full URL — no https:// and no path.',
          ),
        },
      ],
    }),
  }),

  async ({ effects }) => ({
    mcpHostnames:
      (await storeJson.read((s) => s.mcpHostnames).once()) ?? undefined,
  }),

  async ({ effects, input }) => {
    await storeJson.merge(effects, { mcpHostnames: input.mcpHostnames ?? '' })
  },
)
