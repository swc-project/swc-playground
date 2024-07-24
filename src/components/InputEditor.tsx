import { Box, Button, Flex, HStack, Heading } from '@chakra-ui/react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { useAtom } from 'jotai'
import type { editor } from 'monaco-editor'
import { useEffect, useRef } from 'react'
import { CgFileDocument, CgShare } from 'react-icons/cg'
import { parsedSwcConfigAtom } from '../state'
import { editorOptions, parseSWCError, useBorderColor, useMonacoThemeValue } from '../utils'

interface Props {
  code: string
  error: string | null
  onCodeChange(code: string): void
  onReportIssue(): void
  onShare(): void
}

export default function InputEditor(props: Props) {
  const [parsedSwcConfig] = useAtom(parsedSwcConfigAtom)
  const monacoTheme = useMonacoThemeValue()
  const borderColor = useBorderColor()
  const monaco = useMonaco()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    monaco?.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
    })
  }, [monaco])

  useEffect(() => {
    const model = editorRef.current?.getModel()
    if (!monaco || !model) {
      return
    }

    if (props.error) {
      const markers = Array.from(parseSWCError(props.error)).map(
        ([_, message, line, col]): editor.IMarkerData => {
          const lineNumber = Number.parseInt(line!),
            column = Number.parseInt(col!)

          return {
            source: 'swc',
            message: message!,
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNumber,
            startColumn: column,
            endLineNumber: lineNumber,
            endColumn: column,
          }
        }
      )
      monaco.editor.setModelMarkers(model, 'swc', markers)
    }

    return () => monaco.editor.setModelMarkers(model, 'swc', [])
  }, [props.error, monaco])

  const handleEditorDidMount = (instance: editor.IStandaloneCodeEditor) => {
    editorRef.current = instance
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value != null) {
      props.onCodeChange(value)
    }
  }

  const language = parsedSwcConfig.jsc.parser.syntax === 'ecmascript'
    ? 'javascript'
    : 'typescript'

  return (
    <Flex direction="column" gridArea="input" minW={0} minH={0}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md" mb="8px">
          Input
        </Heading>
        <HStack spacing="10px">
          <Button
            size="xs"
            leftIcon={<CgFileDocument />}
            onClick={props.onReportIssue}
          >
            Report Issue
          </Button>
          <Button size="xs" leftIcon={<CgShare />} onClick={props.onShare}>
            Share
          </Button>
        </HStack>
      </Flex>
      <Box
        width="full"
        height="full"
        borderColor={borderColor}
        borderWidth="1px"
      >
        <Editor
          value={props.code}
          language={language}
          defaultLanguage={language}
          theme={monacoTheme}
          options={editorOptions}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
        />
      </Box>
    </Flex>
  )
}
