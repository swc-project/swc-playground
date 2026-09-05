import { Box, Flex, Heading, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react'
import Editor, { useMonaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useEffect } from 'react'
import type { ChangeEvent } from 'react'
import stripAnsi from 'strip-ansi'
import type {
  OutputStructure,
  ParserResult,
  TransformationOutput,
  TransformationResult,
} from '../swc'
import {
  editorOptions as sharedEditorOptions,
  useBgColor,
  useBorderColor,
  useMonacoThemeValue,
} from '../utils'

function isTransformedCode(value: unknown): value is TransformationOutput {
  return typeof (value as TransformationOutput).code === 'string'
}

function containsOutput(value: unknown): value is OutputStructure {
  return typeof (value as OutputStructure).output === 'string'
}

type Output = Record<'text' | 'language' | 'path', string>

function handleOutput(output: TransformationResult | ParserResult): Output {
  if (output.err) {
    const text = stripAnsi(output.val)
    return {
      text,
      language: 'text',
      path: 'error.log',
    }
  }

  if (containsOutput(output.val)) {
    try {
      const text = JSON.parse(output.val.output).__swc_isolated_declarations__
      if (typeof text === 'string') {
        return {
          text,
          language: 'typescript',
          path: 'output.d.ts',
        }
      }
    } catch {}
  }

  if (isTransformedCode(output.val)) {
    const text = output.val.code
    return {
      text,
      language: 'javascript',
      path: 'output.js',
    }
  } else {
    const text = JSON.stringify(output.val, null, 2)
    return {
      text,
      language: 'json',
      path: 'output.json',
    }
  }
}

interface Props {
  output: TransformationResult | ParserResult
  viewMode: string
  onViewModeChange(viewMode: string): void
}

const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  ...sharedEditorOptions,
  readOnly: true,
  wordWrap: 'on',
  renderControlCharacters: false,
  tabSize: 4, // this aligns with swc
}

export default function OutputEditor({
  output,
  viewMode,
  onViewModeChange,
}: Props) {
  const borderColor = useBorderColor()
  const bg = useBgColor()
  const monacoTheme = useMonacoThemeValue()
  const monaco = useMonaco()

  useEffect(() => {
    monaco?.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
    })
  }, [monaco])

  const handleViewModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onViewModeChange(event.target.value)
  }

  const { text: outputContent, path, language: editorLanguage } = handleOutput(output)

  return (
    <Flex direction="column" gridArea="output" minW={0} minH={0}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md" mb="8px">
          Output
        </Heading>
        <Flex alignItems="center">
          View:
          <NativeSelectRoot size="xs" ml="1">
            <NativeSelectField
              bg={bg}
              value={viewMode}
              onChange={handleViewModeChange}
            >
              <option value="code">Compiled Code</option>
              <option value="ast">JSON AST</option>
            </NativeSelectField>
          </NativeSelectRoot>
        </Flex>
      </Flex>
      <Box height="full" borderColor={borderColor} borderWidth="1px">
        <Editor
          value={outputContent}
          language={editorLanguage}
          defaultLanguage="javascript"
          path={path}
          theme={monacoTheme}
          options={editorOptions}
        />
      </Box>
    </Flex>
  )
}
