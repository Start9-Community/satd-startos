import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'bitcoind',
  title: 'Bitcoin (satd)',
  license: 'MIT',
  donationUrl: null,
  packageRepo: 'https://github.com/Start9-Community/satd-startos',
  upstreamRepo: 'https://github.com/epochbtc/satd',
  marketingUrl: 'https://epochbtc.github.io/satd/',
  description: { short, long },
  volumes: ['main'],
  images: {
    satd: {
      source: { dockerTag: 'ghcr.io/epochbtc/satd:0.5.2' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
