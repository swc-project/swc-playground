import { useEffect } from 'react'
import type { editor } from 'monaco-editor'
import Editor, { useMonaco } from '@monaco-editor/react'
import { useAtom } from 'jotai'
import { Box, Flex, Heading } from '@chakra-ui/react'
import { transformationAtom } from '../state'
import { editorOptions as sharedEditorOptions } from '../utils'

const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  ...sharedEditorOptions,
  readOnly: true,
  wordWrap: 'on',
  tabSize: 4, // this aligns with swc
}

export default function OutputEditor() {
  const [transformedOutput] = useAtom(transformationAtom)
  const monaco = useMonaco()

  useEffect(() => {
    monaco?.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
    })
  }, [monaco])

  const output = transformedOutput.ok
    ? transformedOutput.val.code
    : transformedOutput.val

  return (
    <Flex direction="column" width="40vw" height="full">
      <Heading size="md" mb="8px">
        Output
      </Heading>
      <Box height="full" borderColor="gray.400" borderWidth="1px">
        <Editor
          value={output}
          language={transformedOutput.ok ? 'javascript' : 'text'}
          defaultLanguage="javascript"
          path="output.js"
          options={editorOptions}
        />
      </Box>
    </Flex>
  )
}
