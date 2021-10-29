import type * as swc from '@swc/wasm-web'
import { atom } from 'jotai'
import { Ok, Err } from 'ts-results'
import type { Result } from 'ts-results'
import type { SwcConfig } from './state'

type swc = typeof swc

export const swcVersionAtom = atom(
  new URLSearchParams(location.search).get('version') ?? '1.2.102'
)

export async function loadSwc(version: string): Promise<swc> {
  const module: swc = await import(
    /* webpackIgnore: true */
    `https://cdn.jsdelivr.net/npm/@swc/wasm-web@${version}/wasm.js`
  )
  await module.default()
  return module
}

export type TransformationOutput = { code: string }

export type TransformationResult = Result<TransformationOutput, string>

export function transform({
  code,
  config,
  fileName,
  swc,
}: {
  code: string
  fileName: string
  config: SwcConfig
  swc: swc | undefined
}): TransformationResult {
  if (!swc) {
    return Err('Loading swc...')
  }

  try {
    return Ok(swc.transformSync(code, { ...config, filename: fileName }))
  } catch (error) {
    return handleSwcError(error)
  }
}

export type AST = { type: 'Module' | 'Script'; body: unknown }

export type ParserResult = Result<AST, string>

export function parse({
  code,
  config,
  swc,
}: {
  code: string
  config: SwcConfig
  swc: swc | undefined
}): ParserResult {
  if (!swc) {
    return Err('Loading swc...')
  }

  try {
    return Ok(swc.parseSync(code, config.jsc.parser))
  } catch (error) {
    return handleSwcError(error)
  }
}

function handleSwcError(error: unknown): Err<string> {
  if (typeof error === 'string') {
    return Err(error)
  } else if (error instanceof Error) {
    return Err(`${error.toString()}\n\n${error.stack}`)
  } else {
    return Err(String(error))
  }
}
