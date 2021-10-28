import type { ChangeEvent } from 'react'
import useSWR from 'swr'
import { useAtom } from 'jotai'
import { CircularProgress, Flex, Heading, Select, Text } from '@chakra-ui/react'
import { swcVersionAtom } from '../swc'

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

interface Props {
  isLoadingSwc: boolean
}

export default function VersionSelect({ isLoadingSwc }: Props) {
  const [swcVersion, setSwcVersion] = useAtom(swcVersionAtom)
  const { data } = useSWR('@swc/wasm-web', fetchSwcVersions)

  const handleCurrentVersionChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setSwcVersion(event.target.value)
  }

  return (
    <Flex direction="column">
      <Heading size="md" mb="8px">
        Version
      </Heading>
      <Flex
        direction="column"
        p="2"
        bg="white"
        borderColor="gray.400"
        borderWidth="1px"
      >
        {data ? (
          <Select value={swcVersion} onChange={handleCurrentVersionChange}>
            {data.versions.map((version) => (
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
          {isLoadingSwc && (
            <>
              <CircularProgress size="7" isIndeterminate />
              <Text ml="2">Switching version...</Text>
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
