import { atom } from 'jotai'
import { Ok, Err } from 'ts-results'
import type { Result } from 'ts-results'
import { transformSync } from '@swc/wasm-web'

export const codeAtom = atom('')

export const swcConfigAtom = atom({
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
