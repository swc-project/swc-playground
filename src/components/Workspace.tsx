import { useEffect, useMemo, useState } from 'react'
import { useAtom } from 'jotai'
import useSWR from 'swr'
import {
  Center,
  CircularProgress,
  Stack,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { loader } from '@monaco-editor/react'
import { Err } from 'ts-results'
import { codeAtom, fileNameAtom, swcConfigAtom } from '../state'
import { loadSwc, parse, swcVersionAtom, transform } from '../swc'
import type { AST } from '../swc'

import Configuration from './Configuration'
import VersionSelect from './VersionSelect'
import InputEditor from './InputEditor'
import OutputEditor from './OutputEditor'

export default function Workspace() {
  const { data: monaco } = useSWR('monaco', () => loader.init())
  const [swcVersion] = useAtom(swcVersionAtom)
  const { data: swc, error } = useSWR(swcVersion, loadSwc)
  const [code] = useAtom(codeAtom)
  const [swcConfig] = useAtom(swcConfigAtom)
  const [fileName] = useAtom(fileNameAtom)
  const [viewMode, setViewMode] = useState('code')
  const output = useMemo(() => {
    if (error) {
      return Err(String(error))
    }

    if (!swc) {
      return Err('Loading swc...')
    }

    switch (viewMode) {
      case 'ast':
        return parse({ code, config: swcConfig, swc })
      case 'code':
      default:
        return transform({ code, fileName, config: swcConfig, swc })
    }
  }, [code, fileName, swc, error, swcConfig, viewMode])
  const toast = useToast()

  useEffect(() => {
    if (error) {
      toast({
        title: 'Failed to load swc.',
        description: String(error),
        status: 'error',
        duration: 5000,
        position: 'top',
        isClosable: true,
      })
    }
  }, [error, toast])

  const isLoadingMonaco = !monaco
  if (isLoadingMonaco && !swc) {
    return (
      <Center width="full" height="88vh" display="flex" flexDirection="column">
        <CircularProgress isIndeterminate mb="3" />
        <div>
          Loading swc {swcVersion}
          {isLoadingMonaco && ' and editor'}...
        </div>
      </Center>
    )
  }

  if (output.ok === true && viewMode === 'ast') {
    const val = output.val as AST
    adjustOffsetOfAst(val, val.span.start)
  }

  return (
    <Stack
      direction={['column', 'column', 'row']}
      spacing="6"
      height="88vh"
      mt="3"
      mx={[4, 4, 8]}
      as="main"
    >
      <VStack spacing="4" alignItems="unset" width={['full', 'full', '16vw']}>
        <Configuration />
        <VersionSelect isLoadingSwc={!swc && !error} />
      </VStack>
      <InputEditor output={output} />
      <OutputEditor
        output={output}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </Stack>
  )
}

function adjustOffsetOfAst(obj: unknown, startOffset: number) {
  if (Array.isArray(obj)) {
    obj.forEach((item) => adjustOffsetOfAst(item, startOffset))
  } else if (isRecord(obj)) {
    Object.entries(obj).forEach(([key, value]) => {
      if (key === 'span' && value && isSpan(value)) {
        const span = value
        span.start -= startOffset
        span.end -= startOffset
      } else {
        adjustOffsetOfAst(obj[key], startOffset)
      }
    })
  }
}

function isRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null
}

function isSpan(obj: unknown): obj is { start: number; end: number } {
  return (
    typeof obj === 'object' && obj !== null && 'start' in obj && 'end' in obj
  )
}
