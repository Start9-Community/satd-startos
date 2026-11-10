import { ISB } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { networks } from '../utils'

export const network = sdk.Action.withInput(
  'network',

  async () => ({
    name: i18n('Network'),
    description: i18n('Which Bitcoin network this node runs on'),
    warning: i18n(
      'Changing the network restarts the node on a different chain. The existing chain data is kept — each network has its own directory — but the node re-syncs the new network from scratch, and the P2P port changes with it.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  ISB.InputSpec.of({
    network: ISB.Value.select({
      name: i18n('Network'),
      description: i18n(
        'Mainnet is the Bitcoin network. The others are test networks whose coins have no value.',
      ),
      default: 'mainnet',
      values: networks,
    }),
  }),

  async ({ effects }) => ({
    network: (await storeJson.read((s) => s.network).once()) ?? undefined,
  }),

  async ({ effects, input }) => {
    await storeJson.merge(effects, { network: input.network })
  },
)
