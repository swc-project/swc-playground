import { Box, useColorModeValue } from '@chakra-ui/react'
import HeaderBar from './components/HeaderBar'
import Workspace from './components/Workspace'

export default function App() {
  const bg = useColorModeValue('gray.50', 'gray.800')
  return (
    <Box minHeight="100vh" bg={bg}>
      <HeaderBar />
      <Workspace />
    </Box>
  )
}