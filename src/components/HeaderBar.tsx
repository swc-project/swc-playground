import { Box, Flex, HStack, Link } from '@chakra-ui/react'
import Image from 'next/image'
import { CgExternal } from 'react-icons/cg'

export default function HeaderBar() {
  // TODO: Implement color mode with next-themes in Chakra UI v3
  const bg = 'gray.100'
  const borderColor = 'gray.300'

  return (
    <Flex
      as="header"
      justifyContent="space-between"
      h="56px"
      px={[2, 2, 5]}
      py="2"
      bg={bg}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
    >
      <a href="http://swc.rs" target="_blank" rel="noopener noreferrer">
        <Image src="/swc.svg" alt="swc" width="120" height="43" />
      </a>
      <HStack gap="4">
        <Link
          href="https://github.com/swc-project/swc-playground"
          target="_blank"
          rel="noopener noreferrer"
          display="flex"
          alignItems="center"
        >
          GitHub
          <Box display="inline-block" ml="1px">
            <CgExternal />
          </Box>
        </Link>
      </HStack>
    </Flex>
  )
}
