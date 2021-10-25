import { Suspense, lazy } from 'react'
import { Box, Center, ChakraProvider, CircularProgress } from '@chakra-ui/react'
import initSWC from '@swc/wasm-web'
import { loader } from '@monaco-editor/react'
import HeaderBar from './components/HeaderBar'

const Workspace = lazy(async () => {
  await Promise.all([initSWC(), loader.init()])
  return import('./components/Workspace')
})

export default function App() {
  const fallbackUI = (
    <Center width="full" height="88vh" display="flex" flexDirection="column">
      <CircularProgress isIndeterminate mb="3" />
      <div>Loading swc and editor...</div>
    </Center>
  )

  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg="gray.50">
        <HeaderBar />
        <Suspense fallback={fallbackUI}>
          <Workspace />
        </Suspense>
      </Box>
    </ChakraProvider>
  )
}
