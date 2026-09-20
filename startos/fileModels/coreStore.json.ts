import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Bitcoin Core's package store on the shared volume; only its reindex flag is
// touched, everything else passes through untouched.
export const coreStoreJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/store.json' },
  z.looseObject({ reindexBlockchain: z.boolean().catch(false) }),
)
