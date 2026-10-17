import { deepStrictEqual } from 'node:assert/strict'
import { test } from 'node:test'
import { networks, p2pPorts } from '../startos/networks.ts'
import { upstream } from './upstream.ts'

// satd-init exits 2 on a network it does not know and refuses to start when
// SATD_P2P_PORT disagrees with its own table, so a drift here is a startup
// failure on the one network nobody tried.
const initScript = upstream('contrib/stack/satd/satd-init')
if (initScript === null)
  throw new Error('satd-init is not vendored in test/upstream/')

const parsePorts = (src: string): Record<string, number> => {
  const block = src.match(
    /case "\$NETWORK" in\n([\s\S]*?)\n\s*\*\)\n[\s\S]*?esac/,
  )
  if (!block) throw new Error("could not find satd-init's NETWORK case block")
  const found: Record<string, number> = {}
  for (const m of block[1].matchAll(/^\s*(\w+)\)\s*P2P_PORT=(\d+)\s*;;/gm)) {
    found[m[1]] = Number(m[2])
  }
  if (!Object.keys(found).length)
    throw new Error("parsed satd-init's case block but found no arms")
  return found
}

test('the offered networks are the ones satd-init accepts', () => {
  deepStrictEqual(
    Object.keys(networks).sort(),
    Object.keys(parsePorts(initScript)).sort(),
  )
})

test('every P2P port matches satd-init', () => {
  deepStrictEqual({ ...p2pPorts }, parsePorts(initScript))
})
