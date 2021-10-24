import { Flex } from '@chakra-ui/react'

const logoURL = new URL('../../assets/swc.svg', import.meta.url).toString()

export default function HeaderBar() {
  return (
    <Flex
      as="header"
      justifyContent="space-between"
      h="56px"
      px="5"
      py="1.5"
      bg="gray.100"
      borderBottomWidth="1px"
      borderBottomColor="gray.300"
    >
      <img src={logoURL} alt="swc" />
      <Flex></Flex>
    </Flex>
  )
}
