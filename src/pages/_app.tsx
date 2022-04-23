import { ChakraProvider } from '@chakra-ui/react'
import Head from 'next/head'
import type { AppProps } from 'next/app'

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Head>
        <title>SWC Playground</title>
        <link rel="shortcut icon" type="image/svg" href="/swc.svg" />
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default App
