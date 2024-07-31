import { Center, CircularProgress, VStack, useToast } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { loader } from '@monaco-editor/react'
import { useAtom } from 'jotai'
import { Base64 } from 'js-base64'
import { gzip, ungzip } from 'pako'
import { useEffect, useMemo, useState } from 'react'
import semver from 'semver'
import useSWR from 'swr'
import { Err } from 'ts-results'
import { fileNameAtom, parsedSwcConfigAtom, swcConfigAtom } from '../state'
import { type AST, loadSwc, parse, stripTypes, transform } from '../swc'
import Configuration from './Configuration'
import InputEditor from './InputEditor'
import OutputEditor from './OutputEditor'
import VersionSelect from './VersionSelect'

const STORAGE_KEY = 'v1.code'

function getIssueReportUrl({
  code,
  version,
  config,
  playgroundLink,
}: {
  code: string,
  version: string,
  config: string,
  playgroundLink: string,
}): string {
  const reportUrl = new URL(
    `https://github.com/swc-project/swc/issues/new?assignees=&labels=C-bug&template=bug_report.yml`
  )
  reportUrl.searchParams.set('code', code)
  reportUrl.searchParams.set('config', config)
  reportUrl.searchParams.set('repro-link', playgroundLink)
  reportUrl.searchParams.set('version', version)
  return reportUrl.toString()
}

const Main = styled.main`
  display: grid;
  padding: 1em;
  gap: 1em;

  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 1fr);
  grid-template-areas: 'sidebar' 'input' 'output';

  min-height: 88vh;

  @media screen and (min-width: 600px) {
    grid-template-columns: 256px 1fr;
    grid-template-rows: repeat(2, 1fr);
    grid-template-areas: 'sidebar input' 'sidebar output';

    min-height: calc(100vh - 80px);
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 256px repeat(2, 1fr);
    grid-template-rows: 1fr;
    grid-template-areas: 'sidebar input output';

    min-height: calc(100vh - 80px);
  }
`

export default function Workspace() {
  const { data: monaco } = useSWR('monaco', () => loader.init())
  const [swcVersion, setSwcVersion] = useState(() =>
    new URLSearchParams(location.search).get('version') ??
      process.env.NEXT_PUBLIC_SWC_VERSION
  )
  const { data: swc, error } = useSWR(swcVersion, loadSwc, {
    revalidateOnFocus: false,
  })
  const [code, setCode] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const [swcConfigJSON] = useAtom(swcConfigAtom)
  const [swcConfig] = useAtom(parsedSwcConfigAtom)
  const [fileName] = useAtom(fileNameAtom)
  const [viewMode, setViewMode] = useState('code')
  const [isStripTypes, setIsStripTypes] = useState(false)
  const output = useMemo(() => {
    if (error) {
      return Err(String(error))
    }

    if (!swc) {
      return Err('Loading swc...')
    }

    switch (viewMode) {
      case 'ast':
        return parse({ code, config: swcConfig, swc: swc[0] })
      case 'code':
      default:
        return isStripTypes && swc[1]
          ? stripTypes({ code, fileName, config: swcConfig, swc: swc[1] })
          : transform({ code, fileName, config: swcConfig, swc: swc[0] })
    }
  }, [code, fileName, swc, error, swcConfig, viewMode, isStripTypes])
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

  useEffect(() => {
    const url = new URL(location.href)
    const encodedInput = url.searchParams.get('code')
    if (encodedInput) {
      setCode(ungzip(Base64.toUint8Array(encodedInput), { to: 'string' }))
    }
    setIsStripTypes(url.searchParams.has('strip-types'))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, code)
  }, [code])

  const shareUrl = useMemo(() => {
    const url = new URL(location.href)
    url.searchParams.set('version', swcVersion)
    const encodedInput = Base64.fromUint8Array(gzip(code))
    url.searchParams.set('code', encodedInput)
    const encodedConfig = Base64.fromUint8Array(gzip(swcConfigJSON))
    url.searchParams.set('config', encodedConfig)
    if (isStripTypes) {
      url.searchParams.set('strip-types', '')
    }
    return url.toString()
  }, [code, swcConfigJSON, swcVersion, isStripTypes])

  const issueReportUrl = useMemo(
    () =>
      getIssueReportUrl({
        code,
        config: swcConfigJSON,
        version: swcVersion,
        playgroundLink: shareUrl,
      }),
    [code, swcConfigJSON, swcVersion, shareUrl]
  )

  function handleReportIssue() {
    if (code.length > 2000) {
      toast({
        title: 'Code too long',
        description:
          'Your input is too large to share. Please copy the code and paste it into the issue.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }
    window.open(issueReportUrl, '_blank')
  }

  async function handleShare() {
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

  function handleSwcVersionChange(version: string) {
    setSwcVersion(version)
    if (semver.lt(version, '1.7.1')) {
      setIsStripTypes(false)
    }
  }

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
    <Main>
      <VStack spacing={4} alignItems="unset" gridArea="sidebar">
        <Configuration
          swcVersion={swcVersion}
          stripTypes={isStripTypes}
          onStripTypesChange={setIsStripTypes}
        />
        <VersionSelect
          isLoadingSwc={!swc && !error}
          swcVersion={swcVersion}
          onSwcVersionChange={handleSwcVersionChange}
        />
      </VStack>
      <InputEditor
        code={code}
        onCodeChange={setCode}
        error={output.err ? output.val : null}
        onReportIssue={handleReportIssue}
        onShare={handleShare}
      />
      <OutputEditor
        output={output}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </Main>
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

function isSpan(obj: unknown): obj is { start: number, end: number } {
  return (
    typeof obj === 'object' && obj !== null && 'start' in obj && 'end' in obj
  )
}
