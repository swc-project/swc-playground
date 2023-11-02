import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'

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
