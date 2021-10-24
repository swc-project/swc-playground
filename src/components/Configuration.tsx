import type * as React from 'react'
import { useAtom } from 'jotai'
import { Flex, FormControl, FormLabel, Heading, Switch } from '@chakra-ui/react'
import { swcConfigAtom } from '../state'

export default function Configuration() {
  const [swcConfig, setSwcConfig] = useAtom(swcConfigAtom)

  const handleToggleMinify = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSwcConfig({ ...swcConfig, minify: event.target.checked })
  }

  return (
    <Flex direction="column" width="16vw" height="full">
      <Heading size="md" mb="8px">
        Configuration
      </Heading>
      <Flex direction="column" p="8px" borderColor="gray.400" borderWidth="1px">
        <FormControl display="flex" alignItems="center">
          <Switch
            id="swc-minify"
            isChecked={swcConfig.minify}
            onChange={handleToggleMinify}
          />
          <FormLabel htmlFor="swc-minify" ml="2" mb="0">
            Minify
          </FormLabel>
        </FormControl>
      </Flex>
    </Flex>
  )
}
