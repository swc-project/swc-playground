import type * as swc from '@swc/wasm-web'

export const version =
  new URLSearchParams(location.search).get('version') ?? '1.2.102'

export let transformSync: typeof swc.transformSync | undefined

export async function loadSwc() {
  const module: typeof swc = await import(
    /* webpackIgnore: true */
    `https://cdn.jsdelivr.net/npm/@swc/wasm-web@${version}/wasm.js`
  )
  transformSync = module.transformSync
  await module.default()
}
