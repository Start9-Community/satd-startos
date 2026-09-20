import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

// Everything else satd needs on disk is rendered by satd-init on every start.
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return
  await storeJson.merge(
    effects,
    kind === 'install'
      ? {
          mcpToken: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 64 }),
        }
      : {},
  )
})
