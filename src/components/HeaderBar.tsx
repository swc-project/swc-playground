import { Flex, HStack, Link } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'

const logoURL = new URL('../../assets/swc.svg', import.meta.url).toString()

export default function HeaderBar() {
  return (
    <Flex
      as="header"
      justifyContent="space-between"
      h="56px"
      px="5"
      py="2"
      bg="gray.100"
      borderBottomWidth="1px"
      borderBottomColor="gray.300"
    >
      <img src={logoURL} alt="swc" />
      <HStack spacing="4">
        <Link href="https://swc.rs/" isExternal>
          Docs <ExternalLinkIcon mb="1" />
        </Link>
        <Link href="https://github.com/swc-project/swc" isExternal>
          GitHub <ExternalLinkIcon mb="1" />
        </Link>
      </HStack>
    </Flex>
  )
}
