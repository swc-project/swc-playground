import { useEffect, useMemo, useRef } from 'react'
import type { editor } from 'monaco-editor'
import Editor, { useMonaco } from '@monaco-editor/react'
import { useAtom } from 'jotai'
import { Box, Button, Flex, Heading, useToast, HStack } from '@chakra-ui/react'
import { CgShare, CgFileDocument } from 'react-icons/cg'
import { Base64 } from 'js-base64'
import { gzip, ungzip } from 'pako'
import { codeAtom, swcConfigAtom } from '../state'
import {
  editorOptions,
  parseSWCError,
  useBorderColor,
  useMonacoThemeValue,
} from '../utils'
import { swcVersionAtom } from '../swc'
import type { ParserResult, TransformationResult } from '../swc'

const STORAGE_KEY = 'v1.code'

function getReportIssueUrl({
  inputCode,
  version,
  config,
  playgroundLink,
}: {
  inputCode: string
  version: string
  config: string
  playgroundLink: string
}): string {
  let reportUrl = `https://github.com/swc-project/swc/issues/new?assignees=&labels=C-bug&template=bug_report.yml`

  const inputCodeMarkdown = encodeURIComponent(
    '```tsx\n' + inputCode + '\n```\n'
  )
  reportUrl += `&code=${inputCodeMarkdown}`

  const configMarkdown = encodeURIComponent('```json\n' + config + '\n```\n')
  reportUrl += `&config=${configMarkdown}`

  reportUrl += `&repro-link=${encodeURIComponent(playgroundLink)}`

  reportUrl += `&version=${version}`

  return reportUrl
}

interface Props {
  output: TransformationResult | ParserResult
}

export default function InputEditor({ output }: Props) {
  const [code, setCode] = useAtom(codeAtom)
  const [swcConfig] = useAtom(swcConfigAtom)
  const [swcVersion] = useAtom(swcVersionAtom)
  const monacoTheme = useMonacoThemeValue()
  const borderColor = useBorderColor()
  const monaco = useMonaco()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const toast = useToast()

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

    if (output.err) {
      const markers = Array.from(parseSWCError(output.val)).map(
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
  }, [output, monaco])

  useEffect(() => {
    const url = new URL(location.href)
    const encodedInput = url.searchParams.get('code')
    const storedInput = localStorage.getItem(STORAGE_KEY)
    if (encodedInput) {
      setCode(ungzip(Base64.toUint8Array(encodedInput), { to: 'string' }))
    } else if (storedInput) {
      setCode(storedInput)
    }
  }, [setCode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, code)
  }, [code])

  const shareUrl = useMemo(() => {
    const url = new URL(location.href)
    url.searchParams.set('version', swcVersion)
    const encodedInput = Base64.fromUint8Array(gzip(code))
    url.searchParams.set('code', encodedInput)
    const encodedConfig = Base64.fromUint8Array(gzip(JSON.stringify(swcConfig)))
    url.searchParams.set('config', encodedConfig)
    return url.toString()
  }, [code, swcConfig, swcVersion])

  const handleShare = async () => {
    if (!navigator.clipboard) {
      toast({
        title: 'Error',
        description: 'Clipboard is not supported in your environment.',
        status: 'error',
        duration: 3000,
        position: 'top',
        isClosable: true,
      })
      return
    }

    window.history.replaceState(null, '', shareUrl)
    await navigator.clipboard.writeText(shareUrl)
    toast({
      title: 'URL is copied to clipboard.',
      status: 'success',
      duration: 3000,
      position: 'top',
      isClosable: true,
    })
  }

  const handleOpenIssue = () => {
    window.open(
      getReportIssueUrl({
        inputCode: code,
        version: swcVersion,
        config: JSON.stringify(swcConfig, null, 2),
        playgroundLink: shareUrl,
      }),
      '_blank',
      'noopener'
    )
  }

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
    <Flex
      direction="column"
      width={['full', 'full', '40vw']}
      height={['45vh', '45vh', 'full']}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md" mb="8px">
          Input
        </Heading>
        <HStack spacing="10px">
          <Button
            size="xs"
            leftIcon={<CgFileDocument />}
            onClick={handleOpenIssue}
          >
            Report Issue
          </Button>
          <Button size="xs" leftIcon={<CgShare />} onClick={handleShare}>
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
          value={code}
          language={language}
          defaultLanguage="javascript"
          theme={monacoTheme}
          options={editorOptions}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
        />
      </Box>
    </Flex>
  )
}
