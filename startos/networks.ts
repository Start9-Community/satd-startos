// Kept free of SDK imports so test/networks.test.ts can load it under
// node's type stripping.

// satd-init exits 2 on any other NETWORK value.
export const networks = {
  mainnet: 'Mainnet',
  signet: 'Signet',
  testnet4: 'Testnet4',
  testnet: 'Testnet3',
  regtest: 'Regtest',
} as const

export type Network = keyof typeof networks

// satd-init refuses to start when SATD_P2P_PORT disagrees with these.
export const p2pPorts: Record<Network, number> = {
  mainnet: 8333,
  signet: 38333,
  testnet4: 48333,
  testnet: 18333,
  regtest: 18444,
}
