import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// The network is a command-line argument, never a config line: satd accepts a
// `signet=1` line in bitcoin.conf and then runs mainnet regardless.
export const shape = z.object({
  network: z
    .enum(['mainnet', 'signet', 'testnet4', 'testnet', 'regtest'])
    .catch('mainnet'),
  // Comma-separated names for MCP's Host allowlist; empty is loopback only.
  mcpHostnames: z.string().catch(''),
  // Core's rpcauth format, `user:salt$hmac`; the password itself is never kept.
  rpcAuth: z.string().optional().catch(undefined),
  // Written to secrets/mcp-token on every start; satd-init hashes it into the authfile.
  mcpToken: z.string().optional().catch(undefined),
  // One-shot: the next start runs with --reindex and clears it.
  reindex: z.boolean().catch(false),
})

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/startos-store.json',
  },
  shape,
)
