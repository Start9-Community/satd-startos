import { match, ok } from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// StartOS starts every daemon with RUST_LOG=warn,start_core=debug, which satd
// reads in preference to its default of info. Dropping the env line is not a
// type error; only a service log of warnings alone shows it.
const read = (p: string) =>
  readFileSync(new URL(p, import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')

test('satd runs with RUST_LOG=info, not the RUST_LOG StartOS hands it', () => {
  const main = read('../startos/main.ts')
  const start = main.indexOf(".addDaemon('satd',")
  ok(start >= 0, "main.ts has no addDaemon('satd', …)")
  const rest = main.slice(start + 1)
  const next = rest.search(/\.add[A-Z]\w*\(/)
  match(
    next < 0 ? rest : rest.slice(0, next),
    /env:\s*\{[^}]*RUST_LOG:\s*'info'/,
  )
})
