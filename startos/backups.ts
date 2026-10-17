import { sdk } from './sdk'

// The chain, chainstate and indices rebuild from the network; the CA, the MCP
// token and the store do not. Every network but mainnet is a subdirectory.
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main').setOptions({
    exclude: [
      'blocks/',
      'chainstate/',
      'chainstate_background/',
      'mempool.dat',
      '.cookie',
      '*/blocks/',
      '*/chainstate/',
      '*/chainstate_background/',
      '*/mempool.dat',
      '*/.cookie',
      'rpc-cookie',
    ],
  }),
)
