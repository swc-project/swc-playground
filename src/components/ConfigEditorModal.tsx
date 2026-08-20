import {
  Button,
  Code,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { useAtom } from 'jotai'
import type { editor } from 'monaco-editor'
import { useEffect, useState } from 'react'
import { swcConfigAtom } from '../state'
import { editorOptions as sharedEditorOptions, useMonacoThemeValue } from '../utils'

const editorOptions: editor.IEditorConstructionOptions = {
  ...sharedEditorOptions,
  scrollBeyondLastLine: false,
}

export default function ConfigEditorModal() {
  const [swcConfig, setSwcConfig] = useAtom(swcConfigAtom)
  const [editingConfig, setEditingConfig] = useState(swcConfig)
  const monacoTheme = useMonacoThemeValue()
  const monaco = useMonaco()
  const { open, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (!monaco) {
      return
    }

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      allowComments: true,
      trailingCommas: 'ignore',
      enableSchemaRequest: true,
      schemas: [
        {
          uri: 'https://swc.rs/schema.json',
          fileMatch: ['.swcrc'],
        },
      ],
    })
  }, [monaco])

  const handleOpen = () => {
    setEditingConfig(swcConfig)
    onOpen()
  }

  const handleClose = () => {
    setEditingConfig(swcConfig)
    onClose()
  }

  const handleApply = () => {
    try {
      setSwcConfig(editingConfig)
      onClose()
    } catch (error) {
      console.error('Error applying config:', error)
      alert(`Error: ${String(error)}`)
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value != null) {
      setEditingConfig(value)
    }
  }

  return (
    <>
      <Button mt="3" onClick={handleOpen}>
        Edit as JSON
      </Button>
      <DialogRoot size="xl" placement="center" open={open} onOpenChange={(e) => !e.open && handleClose()}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              SWC Configuration (<Code>.swcrc</Code>)
            </DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger />

          <DialogBody>
            <Text mb="4">
              You can paste your config here, or just manually type directly.
            </Text>
            <Editor
              value={editingConfig}
              defaultLanguage="json"
              path=".swcrc"
              options={editorOptions}
              theme={monacoTheme}
              height="40vh"
              onChange={handleEditorChange}
            />
          </DialogBody>

          <DialogFooter>
            <Button colorScheme="blue" mr={3} onClick={handleApply}>
              Apply
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  )
}
