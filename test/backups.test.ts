import { deepEqual, ok } from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// A wrong exclusion is not an error anywhere; the backup just grows by the
// size of the directory it missed.
const src = readFileSync(
  new URL('../startos/backups.ts', import.meta.url),
  'utf8',
)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/.*$/gm, '$1')

const excluded = [...src.matchAll(/'([^']+)'/g)]
  .map((m) => m[1])
  .filter((s) => s !== 'main' && s !== './sdk')

test('every large directory satd writes is excluded, at the root and per network', () => {
  for (const dir of ['blocks/', 'chainstate/', 'chainstate_background/']) {
    ok(excluded.includes(dir), `${dir} is not excluded`)
    ok(excluded.includes(`*/${dir}`), `*/${dir} is not excluded`)
  }
})

test("nothing from Core's layout that satd never creates", () => {
  deepEqual(
    excluded.filter((e) => /indexes|debug\.log/.test(e)),
    [],
  )
})
