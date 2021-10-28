import { useEffect } from 'react'
import type { editor } from 'monaco-editor'
import Editor, { useMonaco } from '@monaco-editor/react'
import { Box, Flex, Heading } from '@chakra-ui/react'
import { editorOptions as sharedEditorOptions } from '../utils'
import type { TransformationResult } from '../swc'

interface Props {
  output: TransformationResult
}

const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  ...sharedEditorOptions,
  readOnly: true,
  wordWrap: 'on',
  tabSize: 4, // this aligns with swc
}

export default function OutputEditor({ output }: Props) {
  const monaco = useMonaco()

  useEffect(() => {
    monaco?.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
    })
  }, [monaco])

  const outputContent = output.ok ? output.val.code : output.val

  return (
    <Flex direction="column" width="40vw" height="full">
      <Heading size="md" mb="8px">
        Output
      </Heading>
      <Box height="full" borderColor="gray.400" borderWidth="1px">
        <Editor
          value={outputContent}
          language={output.ok ? 'javascript' : 'text'}
          defaultLanguage="javascript"
          path="output.js"
          options={editorOptions}
        />
      </Box>
    </Flex>
  )
}
