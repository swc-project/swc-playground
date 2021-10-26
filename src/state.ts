import { atom } from 'jotai'
import { Ok, Err } from 'ts-results'
import type { Result } from 'ts-results'
import { transformSync } from './swc'

export type SwcParserOptions =
  | { syntax: 'ecmascript'; jsx: boolean }
  | { syntax: 'typescript'; tsx: boolean }

export interface CompressOptions {
  arguments: boolean
  arrows: boolean
  booleans: boolean
  booleans_as_integers: boolean
  collapse_vars: boolean
  comparisons: boolean
  computed_props: boolean
  conditionals: boolean
  dead_code: boolean
  directives: boolean
  drop_console: boolean
  drop_debugger: boolean
  evaluate: boolean
  expression: boolean
  hoist_funs: boolean
  hoist_props: boolean
  hoist_vars: boolean
  if_return: boolean
  join_vars: boolean
  keep_classnames: boolean
  keep_fargs: boolean
  keep_fnames: boolean
  keep_infinity: boolean
  loops: boolean
  negate_iife: boolean
  properties: boolean
  reduce_funcs: boolean
  reduce_vars: boolean
  side_effects: boolean
  switches: boolean
  typeofs: boolean
  unsafe: boolean
  unsafe_arrows: boolean
  unsafe_comps: boolean
  unsafe_Function: boolean
  unsafe_math: boolean
  unsafe_symbols: boolean
  unsafe_methods: boolean
  unsafe_proto: boolean
  unsafe_regexp: boolean
  unsafe_undefined: boolean
  unused: boolean
}

export const defaultCompressOptions: CompressOptions = {
  arguments: false,
  arrows: true,
  booleans: true,
  booleans_as_integers: false,
  collapse_vars: true,
  comparisons: true,
  computed_props: false,
  conditionals: false,
  dead_code: false,
  directives: false,
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
  switches: false,
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
}

export interface MangleOptions {
  toplevel: boolean
  keep_classnames: boolean
  keep_fnames: boolean
  keep_private_props: boolean
  ie8: boolean
  safari10: boolean
}

export const defaultMangleOptions: MangleOptions = {
  toplevel: false,
  keep_classnames: false,
  keep_fnames: false,
  keep_private_props: false,
  ie8: false,
  safari10: false,
}

export const codeAtom = atom('')

export const swcConfigAtom = atom({
  jsc: {
    parser: {
      syntax: 'ecmascript',
      jsx: false,
    } as SwcParserOptions,
    target: 'es5',
    loose: false,
    minify: {
      compress: false as CompressOptions | false,
      mangle: false as MangleOptions | false,
    },
  },
  module: {
    type: 'es6',
  },
  minify: false,
  isModule: true,
})

export const fileNameAtom = atom((get) => {
  const config = get(swcConfigAtom)

  if (config.jsc.parser.syntax === 'ecmascript') {
    if (config.jsc.parser.jsx) {
      return 'input.jsx'
    } else {
      return 'input.js'
    }
  } else {
    if (config.jsc.parser.tsx) {
      return 'input.tsx'
    } else {
      return 'input.ts'
    }
  }
})

export type TransformationResult = Result<{ code: string }, string>

export const transformationAtom = atom((get): TransformationResult => {
  const code = get(codeAtom)

  if (!transformSync) {
    return Err('Failed to load swc. Is version correct?')
  }

  try {
    return Ok(
      transformSync(code, {
        ...get(swcConfigAtom),
        filename: get(fileNameAtom),
      })
    )
  } catch (error) {
    if (typeof error === 'string') {
      return Err(error)
    } else if (error instanceof Error) {
      return Err(`${error.toString()}\n\n${error.stack}`)
    } else {
      return Err(String(error))
    }
  }
})
