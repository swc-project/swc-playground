import { atom } from 'jotai'
import { parse } from 'jsonc-parser'
import type { CompressOptions, Config, EnvOptions, MangleOptions } from './swc'

/** @see https://github.com/swc-project/swc/blob/dada2d7d554fa0733a3c65c512777f1548d41a35/crates/swc_ecma_minifier/src/option/mod.rs#L114 */
export const defaultCompressOptions: CompressOptions = {
  arguments: false,
  arrows: true,
  booleans: true,
  booleans_as_integers: false,
  collapse_vars: true,
  comparisons: true,
  computed_props: true,
  conditionals: true,
  dead_code: true,
  directives: true,
  drop_console: false,
  drop_debugger: true,
  evaluate: true,
  expression: false,
  hoist_funs: false,
  hoist_props: true,
  hoist_vars: false,
  if_return: true,
  join_vars: true,
  keep_classnames: false,
  keep_fargs: true,
  keep_fnames: false,
  keep_infinity: false,
  loops: true,
  negate_iife: true,
  properties: true,
  reduce_funcs: false,
  reduce_vars: false,
  side_effects: true,
  switches: true,
  typeofs: true,
  unsafe: false,
  unsafe_arrows: false,
  unsafe_comps: false,
  unsafe_Function: false,
  unsafe_math: false,
  unsafe_symbols: false,
  unsafe_methods: false,
  unsafe_proto: false,
  unsafe_regexp: false,
  unsafe_undefined: false,
  unused: true,
  const_to_let: true,
  pristine_globals: true,
}

export const defaultMangleOptions: MangleOptions = {
  toplevel: false,
  keep_classnames: false,
  keep_fnames: false,
  keep_private_props: false,
  ie8: false,
  safari10: false,
}

export const defaultEnvOptions: EnvOptions = {
  targets: '',
}

export const swcConfigAtom = atom(
  JSON.stringify(
    {
      jsc: {
        parser: {
          syntax: 'ecmascript',
          jsx: false,
        },
        target: 'es5',
        loose: false,
        minify: {
          compress: false,
          mangle: false,
        },
      },
      module: {
        type: 'es6',
      },
      minify: false,
      isModule: true,
    },
    null,
    2
  )
)

export const parsedSwcConfigAtom = atom<Config>((get) =>
  parse(get(swcConfigAtom), undefined, { allowTrailingComma: true })
)

export const fileNameAtom = atom((get) => {
  const config = get(parsedSwcConfigAtom)

  if (config.jsc.parser.syntax === 'typescript') {
    if (config.jsc.parser.tsx) {
      return 'input.tsx'
    } else {
      return 'input.ts'
    }
  } else {
    if (config.jsc.parser.jsx) {
      return 'input.jsx'
    } else {
      return 'input.js'
    }
  }
})
