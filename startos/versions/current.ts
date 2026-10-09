import { rm } from 'fs/promises'
import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import type { MigrationOpts } from '@start9labs/start-sdk/lib/version/VersionInfo'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { coreStoreJson } from '../fileModels/coreStore.json'
import { removeNetworkFiles } from '../utils'

const { main } = sdk.volumes

// Core and satd share blocks/ (Core's blk*.dat layout, xor key included);
// everything else is rebuilt from it by a reindex on the receiving side.
const fromCore = {
  up: async ({ effects }: MigrationOpts) => {
    await removeNetworkFiles([
      'chainstate',
      'chainstate_background',
      'indexes',
      'peers.dat',
      'mempool.dat',
    ])
    await storeJson.merge(effects, { reindex: true })
  },
  down: async ({ effects }: MigrationOpts) => {
    await removeNetworkFiles([
      'chainstate',
      'chainstate_background',
      'peers.dat',
      'mempool.dat',
    ])
    for (const p of [
      'bitcoin.conf',
      'authfile.toml',
      'rpc-cookie',
      'tls',
      'secrets',
      'startos-store.json',
    ])
      await rm(main.subpath(p), { recursive: true, force: true })
    await coreStoreJson.merge(effects, { reindexBlockchain: true })
  },
}

export const current = VersionInfo.of({
  version: '#satd:0.5.2:0',
  releaseNotes: {
    en_US: 'Initial release for StartOS',
    es_ES: 'Lanzamiento inicial para StartOS',
    de_DE: 'Erstveröffentlichung für StartOS',
    pl_PL: 'Pierwsze wydanie dla StartOS',
    fr_FR: 'Version initiale pour StartOS',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
    other: {
      ['^28']: fromCore,
      ['^29']: fromCore,
      ['^30']: fromCore,
      ['^31']: fromCore,
      ['#knotsprerdts']: fromCore,
    },
  },
})
