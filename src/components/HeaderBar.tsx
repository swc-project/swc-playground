import { Box, Flex, Link } from '@chakra-ui/react'
import { HiExternalLink } from 'react-icons/hi'

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
      <Link
        href="https://github.com/g-plane/swc-playground"
        isExternal
        display="flex"
        alignItems="center"
      >
        GitHub
        <Box display="inline-block" ml="1px">
          <HiExternalLink />
        </Box>
      </Link>
    </Flex>
  )
}
