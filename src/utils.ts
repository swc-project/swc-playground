import type { editor } from 'monaco-editor'

export const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  fontFamily:
    '"Cascadia Code", "Jetbrains Mono", "Fira Code", "Menlo", "Consolas", monospace',
  fontLigatures: true,
  fontSize: 14,
  lineHeight: 24,
  minimap: { enabled: false },
  tabSize: 2,
}

const RE_SWC_ERROR = /error:\s(.+?)\n\s-->\s.+?:(\d+):(\d+)/gm

export function parseSWCError(message: string) {
  return message.matchAll(RE_SWC_ERROR)
}
