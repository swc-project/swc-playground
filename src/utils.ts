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
  return 'light'
}

export function useBorderColor() {
  return 'gray.400'
}

export function useBgColor() {
  return 'white'
}

const RE_SWC_ERROR = /error:\s(.+?)\n\s-->\s.+?:(\d+):(\d+)/gm

export function parseSWCError(message: string) {
  return message.matchAll(RE_SWC_ERROR)
}

export const JSONC_FORMATTING_OPTIONS: FormattingOptions = {
  tabSize: 2,
  insertSpaces: true,
}
