import { Box } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import HeaderBar from '../components/HeaderBar'

const Workspace = dynamic(() => import('../components/Workspace'), {
  ssr: false,
})

export default function App() {
  const bg = 'gray.50'

  return (
    <Box minHeight="100vh" pb={[8, 8, 0]} bg={bg}>
      <HeaderBar />
      <Workspace />
    </Box>
  )
}
