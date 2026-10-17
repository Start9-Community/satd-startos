import { existsSync, readFileSync } from 'node:fs'

// A file from satd's own tree, vendored into test/upstream/ by the developer's
// sync script from the same satd commit the package targets.
export const upstream = (satdPath: string): string | null => {
  const vendored = new URL(
    `./upstream/${satdPath.split('/').pop()}`,
    import.meta.url,
  )
  return existsSync(vendored) ? readFileSync(vendored, 'utf8') : null
}
