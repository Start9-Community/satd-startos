import { sdk } from './sdk'

export { networks, p2pPorts } from './networks'
export type { Network } from './networks'

export const rootDir = '/var/lib/satd'

// satd-init renders these into bitcoin.conf on every network; only the P2P
// port follows the chain.
export const rpcPort = 8332
export const electrumPort = 50001
export const electrumTlsPort = 50002
export const esploraPort = 3000
export const esploraTlsPort = 3001
export const mcpPort = 8339

export const rpcHostId = 'rpc'
export const electrumHostId = 'electrum'
export const esploraHostId = 'esplora'
export const mcpHostId = 'mcp'
export const peerHostId = 'peer'

export const rpcInterfaceId = 'rpc'
export const electrumInterfaceId = 'electrum'
export const esploraInterfaceId = 'esplora'
export const mcpInterfaceId = 'mcp'
export const peerInterfaceId = 'peer'

// lxcbr0: satd-init renders it as rpcallowip, and the OS reverse proxy and
// every other package arrive from it.
export const bridgeSubnet = '10.0.3.0/24'

export const rpcUsername = 'satd'

export const satdMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  mountpoint: rootDir,
  subpath: null,
  readonly: false,
  type: 'directory',
})

// rpc-cookie is satd-init's symlink to the live network's cookie; bitcoin.conf
// carries no network line for sat-cli to derive the path or the port from.
export const satCliArgs = [
  'sat-cli',
  `-datadir=${rootDir}`,
  `-rpcport=${rpcPort}`,
  `-rpccookiefile=${rootDir}/rpc-cookie`,
  '-rpcconnect=127.0.0.1',
]

export type GetBlockchainInfo = {
  chain: string
  blocks: number
  headers: number
  initialblockdownload: boolean
}
