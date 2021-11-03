import { ChakraProvider } from '@chakra-ui/react'
import { render } from 'react-dom'
import App from './App'

const container = document.createElement('div')
document.body.appendChild(container)

render(
  <ChakraProvider>
    <App />
  </ChakraProvider>,
  container
)
