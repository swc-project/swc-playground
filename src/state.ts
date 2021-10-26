import { atom } from 'jotai'
import { Ok, Err } from 'ts-results'
import type { Result } from 'ts-results'
import { transformSync } from './swc'

export type SwcParserOptions =
  | { syntax: 'ecmascript'; jsx: boolean }
  | { syntax: 'typescript'; tsx: boolean }

export const codeAtom = atom('')

export const swcConfigAtom = atom({
  jsc: {
    parser: {
      syntax: 'ecmascript',
      jsx: false,
    } as SwcParserOptions,
    target: 'es5',
    loose: false,
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
