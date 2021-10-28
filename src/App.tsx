import { Box, ChakraProvider } from '@chakra-ui/react'
import HeaderBar from './components/HeaderBar'
import Workspace from './components/Workspace'

export default function App() {
  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg="gray.50">
        <HeaderBar />
        <Workspace />
      </Box>
    </ChakraProvider>
  )
}
