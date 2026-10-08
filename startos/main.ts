import { mkdir } from 'fs/promises'
import { healthFns } from '@start9labs/start-sdk'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  bridgeSubnet,
  GetBlockchainInfo,
  networks,
  p2pPorts,
  rootDir,
  satCliArgs,
  satdMounts,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const store = await storeJson
    .read(({ network, mcpHostnames, rpcAuth, mcpToken }) => ({
      network,
      mcpHostnames,
      rpcAuth,
      mcpToken,
    }))
    .const(effects)
  if (!store) throw new Error('No store')
  const { network, mcpHostnames, rpcAuth, mcpToken } = store
  const reindex = await storeJson.read((s) => s.reindex).once()
  if (reindex) await storeJson.merge(effects, { reindex: false })

  const satdSub = await sdk.SubContainer.eager(
    effects,
    { imageId: 'satd' },
    satdMounts,
    'satd-sub',
  )

  if (mcpToken) {
    await mkdir(satdSub.subpath(`${rootDir}/secrets`), {
      recursive: true,
      mode: 0o700,
    })
    await satdSub.writeFile(`${rootDir}/secrets/mcp-token`, `${mcpToken}\n`, {
      mode: 0o600,
    })
  }

  const probe = async <T>(
    ...cmd: string[]
  ): Promise<{ value: T } | { health: healthFns.HealthCheckResult }> => {
    try {
      const res = await satdSub.exec([...satCliArgs, ...cmd])
      if (
        res.exitCode !== 0 ||
        typeof res.stdout !== 'string' ||
        res.stdout === ''
      ) {
        return {
          health: {
            result: 'starting' as const,
            message: i18n('satd is starting…'),
          },
        }
      }
      return { value: JSON.parse(res.stdout) as T }
    } catch (e) {
      return {
        health: {
          result: 'failure' as const,
          message: i18n('Could not read ${cmd} from satd: ${error}', {
            cmd: cmd[0],
            error: String(e),
          }),
        },
      }
    }
  }

  return (
    sdk.Daemons.of(effects)
      .addOneshot('own-volume', {
        subcontainer: satdSub,
        exec: {
          command: ['chown', '-R', 'satd:satd', rootDir],
          user: 'root',
        },
        requires: [],
      })
      // The image's own first-run script: issues the per-install CA, renders
      // bitcoin.conf for the network, hashes the MCP token into the authfile.
      .addOneshot('satd-init', {
        subcontainer: satdSub,
        exec: {
          command: ['/usr/local/bin/satd-init'],
          user: 'satd',
          env: {
            NETWORK: network,
            SATD_MCP: '1',
            SATD_STACK_SUBNET: bridgeSubnet,
            SATD_TLS_HOSTNAME: 'satd.startos',
            SATD_MCP_ALLOWED_HOSTS: mcpHostnames,
            SATD_P2P_PORT: String(p2pPorts[network]),
            SATD_CA_EXPORT_HINT:
              'the CA certificate is shown by this service’s "CA Certificate" action',
          },
        },
        requires: ['own-volume'],
      })
      .addDaemon('satd', {
        subcontainer: satdSub,
        exec: {
          // `--chain=`: there are bare flags for the test networks but none for mainnet.
          command: [
            'satd',
            `--datadir=${rootDir}`,
            `--chain=${network}`,
            ...(rpcAuth ? [`--rpcauth=${rpcAuth}`] : []),
            ...(reindex ? ['--reindex'] : []),
          ],
          // StartOS hands every daemon RUST_LOG=warn,start_core=debug, and satd
          // honors RUST_LOG over its default of info: without this the log
          // shows warnings only, with no sync, reindex or shutdown progress.
          env: { RUST_LOG: 'info' },
          user: 'satd',
          sigtermTimeout: 600_000,
        },
        ready: {
          display: i18n('Node'),
          // satd-healthcheck probes the RPC listener; /readyz stays 503 for the
          // whole initial sync.
          fn: async () => {
            const res = await satdSub.exec(['/usr/local/bin/satd-healthcheck'])
            return res.exitCode === 0
              ? { result: 'success' as const, message: i18n('satd is ready') }
              : {
                  result: 'starting' as const,
                  message: i18n('satd is starting…'),
                }
          },
        },
        requires: ['satd-init'],
      })
      .addHealthCheck('sync-progress', {
        ready: {
          display: i18n('Blockchain Sync'),
          trigger: sdk.trigger.statusTrigger(30_000, {
            starting: 5_000,
            failure: 5_000,
          }),
          fn: async () => {
            const res = await probe<GetBlockchainInfo>('getblockchaininfo')
            if ('health' in res) return res.health
            const info = res.value

            const chain = networks[network]

            if (!info.initialblockdownload)
              return {
                result: 'success' as const,
                message: i18n('satd is fully synced with ${chain}', { chain }),
              }

            if (info.blocks === 0)
              return {
                result: 'loading' as const,
                message: info.headers
                  ? i18n('Syncing ${chain} block headers: ${count}', {
                      chain,
                      count: String(info.headers),
                    })
                  : i18n('Syncing ${chain} block headers…', { chain }),
              }

            // satd's verificationprogress is timestamp-based and reads ~69% at genesis.
            // Strings: start-sdk 2.0.9's i18n throws on a number (start-technologies#3839).
            return {
              result: 'loading' as const,
              message: i18n(
                'Syncing ${chain} blocks: ${blocks} of ${headers}',
                {
                  chain,
                  blocks: String(info.blocks),
                  headers: String(info.headers),
                },
              ),
            }
          },
        },
        requires: ['satd'],
      })
  )
})
