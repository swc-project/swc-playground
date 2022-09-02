import type { ChangeEvent } from 'react'
import useSWR from 'swr'
import { useAtom } from 'jotai'
import {
  Box,
  CircularProgress,
  Flex,
  Heading,
  HStack,
  Link,
  Select,
  Text,
} from '@chakra-ui/react'
import { HiExternalLink } from 'react-icons/hi'
import semver from 'semver'
import { swcVersionAtom } from '../swc'
import { useBgColor, useBorderColor } from '../utils'

type PackageInfo = {
  tags: {
    latest: string
  }
  versions: string[]
}

const fetchSwcVersions = (packageName: string): Promise<PackageInfo> =>
  fetch(`https://data.jsdelivr.com/v1/package/npm/${packageName}`).then(
    (response) => response.json()
  )

function mergeVersions(...versions: string[][]): string[] {
  return [...new Set(versions.flat())].sort(semver.rcompare)
}

interface Props {
  isLoadingSwc: boolean
}

export default function VersionSelect({ isLoadingSwc }: Props) {
  const [swcVersion, setSwcVersion] = useAtom(swcVersionAtom)
  const { data: oldSWC, error: errorOfOld } = useSWR(
    '@swc/wasm-web',
    fetchSwcVersions
  )
  const { data: newSWC, error: errorOfNew } = useSWR(
    '@swc/binding_core_wasm',
    fetchSwcVersions
  )
  const bg = useBgColor()
  const borderColor = useBorderColor()

  const handleCurrentVersionChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setSwcVersion(event.target.value)
  }

  const isLoading =
    isLoadingSwc || (!oldSWC && !errorOfOld) || (!newSWC && !errorOfNew)

  return (
    <Flex direction="column">
      <Heading size="md" mb="8px">
        Version
      </Heading>
      <Flex
        direction="column"
        p="2"
        bg={bg}
        borderColor={borderColor}
        borderWidth="1px"
      >
        {oldSWC && newSWC ? (
          <Select value={swcVersion} onChange={handleCurrentVersionChange}>
            {mergeVersions(oldSWC.versions, newSWC.versions).map((version) => (
              <option key={version} value={version}>
                {version}
              </option>
            ))}
          </Select>
        ) : (
          <Select>
            <option>{swcVersion}</option>
          </Select>
        )}
        <Flex alignItems="center" my="2" height="8">
          {isLoading && (
            <>
              <CircularProgress size="7" isIndeterminate />
              <Text ml="2">Please wait...</Text>
            </>
          )}
        </Flex>
        <Flex px="2">
          <Text>More links:</Text>
          <HStack spacing="4" ml="1">
            <Link
              href="https://swc.rs/"
              isExternal
              display="flex"
              alignItems="center"
            >
              Docs
              <Box display="inline-block" ml="1px">
                <HiExternalLink />
              </Box>
            </Link>
            <Link
              href="https://github.com/swc-project/swc"
              isExternal
              display="flex"
              alignItems="center"
            >
              GitHub
              <Box display="inline-block" ml="1px">
                <HiExternalLink />
              </Box>
            </Link>
          </HStack>
        </Flex>
      </Flex>
    </Flex>
  )
}
