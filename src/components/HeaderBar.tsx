import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import Image from 'next/image'
import { useEffect } from 'react'
import { CgExternal, CgMoon, CgSun } from 'react-icons/cg'

const logoURL = new URL('../../assets/swc.svg', import.meta.url).toString()

export default function HeaderBar() {
  const { colorMode, toggleColorMode, setColorMode } = useColorMode()
  const bg = useColorModeValue('gray.100', 'gray.900')
  const borderColor = useColorModeValue('gray.300', 'gray.700')

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (query?.matches) {
      setColorMode('dark')
    }

    const listener = (event: MediaQueryListEvent) => {
      setColorMode(event.matches ? 'dark' : 'light')
    }

    query?.addEventListener('change', listener)

    return () => query?.removeEventListener('change', listener)
  }, [setColorMode])

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
        <Image src={logoURL} alt="swc" width="120" height="43" />
      </a>
      <HStack spacing="4">
        <Button variant="ghost" onClick={toggleColorMode}>
          {colorMode === 'dark' ? <CgMoon /> : <CgSun />}
        </Button>
        <Link
          href="https://github.com/swc-project/swc-playground"
          isExternal
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
