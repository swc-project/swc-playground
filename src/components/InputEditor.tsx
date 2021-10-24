import { useEffect, useRef } from 'react'
import type { editor } from 'monaco-editor'
import Editor, { useMonaco } from '@monaco-editor/react'
import { useAtom } from 'jotai'
import { Box, Flex, Heading } from '@chakra-ui/react'
import { codeAtom, swcConfigAtom, transformationAtom } from '../state'
import { editorOptions, parseSWCError } from '../utils'

export default function InputEditor() {
  const [code, setCode] = useAtom(codeAtom)
  const [transformedOutput] = useAtom(transformationAtom)
  const [swcConfig] = useAtom(swcConfigAtom)
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

    if (transformedOutput.ok) {
      monaco.editor.setModelMarkers(model, 'swc', [])
    } else {
      const markers = Array.from(parseSWCError(transformedOutput.val)).map(
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
  }, [transformedOutput, monaco])

  const handleEditorDidMount = (instance: editor.IStandaloneCodeEditor) => {
    editorRef.current = instance
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value != null) {
      setCode(value)
    }
  }

  const language =
    swcConfig.jsc.parser.syntax === 'ecmascript' ? 'javascript' : 'typescript'

  return (
    <Flex direction="column" width="40vw" height="full">
      <Heading size="md" mb="8px">
        Input
      </Heading>
      <Box width="full" height="full" borderColor="gray.400" borderWidth="1px">
        <Editor
          value={code}
          language={language}
          defaultLanguage="javascript"
          options={editorOptions}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
        />
      </Box>
    </Flex>
  )
}
