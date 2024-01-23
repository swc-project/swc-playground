import { useColorModeValue } from '@chakra-ui/react'
import type { FormattingOptions } from 'jsonc-parser'
import type { editor } from 'monaco-editor'

export const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  fontFamily: '"Cascadia Code", "Jetbrains Mono", "Fira Code", "Menlo", "Consolas", monospace',
  fontLigatures: true,
  fontSize: 14,
  lineHeight: 24,
  minimap: { enabled: false },
  tabSize: 2,
}

export function useMonacoThemeValue() {
  return useColorModeValue('light', 'vs-dark')
}

export function useBorderColor() {
  return useColorModeValue('gray.400', 'gray.600')
}

export function useBgColor() {
  return useColorModeValue('white', 'gray.700')
}

const RE_SWC_ERROR = /error:\s(.+?)\n\s-->\s.+?:(\d+):(\d+)/gm

export function parseSWCError(message: string) {
  return message.matchAll(RE_SWC_ERROR)
}

export const JSONC_FORMATTING_OPTIONS: FormattingOptions = {
  tabSize: 2,
  insertSpaces: true,
}
