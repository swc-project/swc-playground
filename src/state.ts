import { atom } from 'jotai'
import { Ok, Err } from 'ts-results'
import type { Result } from 'ts-results'
import { transformSync } from '@swc/wasm-web'

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
  minify: false,
})

export type TransformationResult = Result<{ code: string }, string>

export const transformationAtom = atom((get): TransformationResult => {
  const code = get(codeAtom)

  try {
    return Ok(transformSync(code, get(swcConfigAtom)))
  } catch (error) {
    return Err(error as string)
  }
})
