import { useEffect } from 'react'
import type * as React from 'react'
import { useAtom } from 'jotai'
import {
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Switch,
  VStack,
} from '@chakra-ui/react'
import { Base64 } from 'js-base64'
import { ungzip } from 'pako'
import {
  defaultCompressOptions,
  defaultEnvOptions,
  defaultMangleOptions,
  swcConfigAtom,
} from '../state'
import type { EsVersion, ModuleOptions, ParserOptions } from '../swc'
import CompressOptionsModal from './CompressOptionsModal'
import MangleOptionsModal from './MangleOptionsModal'
import ConfigEditorModal from './ConfigEditorModal'
import { useBgColor, useBorderColor } from '../utils'

const STORAGE_KEY = 'v1.config'

export default function Configuration() {
  const [swcConfig, setSwcConfig] = useAtom(swcConfigAtom)
  const bg = useBgColor()
  const borderColor = useBorderColor()

  useEffect(() => {
    const url = new URL(location.href)
    const encodedConfig = url.searchParams.get('config')
    const storedConfig = localStorage.getItem(STORAGE_KEY)
    if (encodedConfig) {
      setSwcConfig(
        JSON.parse(ungzip(Base64.toUint8Array(encodedConfig), { to: 'string' }))
      )
    } else if (storedConfig) {
      setSwcConfig(JSON.parse(storedConfig))
    }
  }, [setSwcConfig])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(swcConfig))
  }, [swcConfig])

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSwcConfig((config) => {
      const jsxOrTsx =
        config.jsc.parser.syntax === 'typescript'
          ? config.jsc.parser.tsx
          : config.jsc.parser.jsx
      const parserOptions: ParserOptions =
        event.target.value === 'typescript'
          ? { syntax: 'typescript', tsx: jsxOrTsx }
          : { syntax: 'ecmascript', jsx: jsxOrTsx }

      return {
        ...config,
        jsc: {
          ...config.jsc,
          parser: parserOptions,
        },
      }
    })
  }

  const handleTargetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSwcConfig((config) => ({
      ...config,
      jsc: {
        ...config.jsc,
        target: event.target.value as EsVersion,
      },
    }))
  }

  const handleModuleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSwcConfig((config) => ({
      ...config,
      module: {
        ...config.module,
        type: event.target.value as ModuleOptions['type'],
      },
    }))
  }

  const handleSourceTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSwcConfig((config) => ({
      ...config,
      isModule: event.target.value === 'module',
    }))
  }

  const handleToggleJSX = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSwcConfig((config) => ({
      ...config,
      jsc: {
        ...config.jsc,
        parser: { ...config.jsc.parser, jsx: event.target.checked },
      },
    }))
  }

  const handleToggleTSX = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSwcConfig((config) => ({
      ...config,
      jsc: {
        ...config.jsc,
        parser: { ...config.jsc.parser, tsx: event.target.checked },
      },
    }))
  }

  const handleToggleMinify = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSwcConfig((config) => ({
      ...config,
      minify: event.target.checked,
    }))
  }

  const handleToggleCompress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const options = event.target.checked ? defaultCompressOptions : false
    setSwcConfig((config) => ({
      ...config,
      jsc: {
        ...config.jsc,
        minify: { ...config.jsc.minify, compress: options },
      },
    }))
  }

  const handleToggleMangle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const options = event.target.checked ? defaultMangleOptions : false
    setSwcConfig((config) => ({
      ...config,
      jsc: { ...config.jsc, minify: { ...config.jsc.minify, mangle: options } },
    }))
  }

  const handleToggleLoose = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSwcConfig((config) => ({
      ...config,
      jsc: { ...config.jsc, loose: event.target.checked },
    }))
  }

  const handleToggleEnvTargets = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const options = event.target.checked ? defaultEnvOptions : undefined
    setSwcConfig((config) => ({ ...config, env: options }))
  }

  const handleEnvTargetsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSwcConfig((config) => ({
      ...config,
      env: { ...config.env, targets: event.target.value },
    }))
  }

  const handleToggleEnvBugfixes = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSwcConfig((config) => ({
      ...config,
      env: { ...config.env, bugfixes: event.target.checked ? true : undefined },
    }))
  }

  return (
    <Flex direction="column">
      <Heading size="md" mb="8px">
        Configuration
      </Heading>
      <Flex
        direction="column"
        p="2"
        bg={bg}
        borderColor={borderColor}
        borderWidth="1px"
      >
        <VStack spacing="2">
          <FormControl>
            <FormLabel htmlFor="swc-syntax">Language</FormLabel>
            <Select
              id="swc-syntax"
              value={swcConfig.jsc.parser.syntax}
              onInput={handleLanguageChange}
            >
              <option value="ecmascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
            </Select>
          </FormControl>
          <FormControl isDisabled={swcConfig.env?.targets != null}>
            <FormLabel htmlFor="swc-target">Target</FormLabel>
            <Select
              id="swc-target"
              value={swcConfig.jsc.target}
              onChange={handleTargetChange}
            >
              <option value="es3">ES3</option>
              <option value="es5">ES5</option>
              <option value="es2015">ES2015</option>
              <option value="es2016">ES2016</option>
              <option value="es2017">ES2017</option>
              <option value="es2018">ES2018</option>
              <option value="es2019">ES2019</option>
              <option value="es2020">ES2020</option>
              <option value="es2021">ES2021</option>
              <option value="es2022">ES2022</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="swc-module">Module</FormLabel>
            <Select
              id="swc-module"
              value={swcConfig.module?.type}
              onChange={handleModuleChange}
            >
              <option value="es6">ES Modules</option>
              <option value="commonjs">CommonJS</option>
              <option value="amd">AMD</option>
              <option value="umd">UMD</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="swc-source-type">Source Type</FormLabel>
            <Select
              id="swc-source-type"
              value={swcConfig.isModule ? 'module' : 'script'}
              onChange={handleSourceTypeChange}
            >
              <option value="module">Module</option>
              <option value="script">Script</option>
            </Select>
          </FormControl>
          {swcConfig.jsc.parser.syntax === 'ecmascript' ? (
            <FormControl display="flex" alignItems="center">
              <Switch
                id="swc-jsx"
                isChecked={swcConfig.jsc.parser.jsx}
                onChange={handleToggleJSX}
              />
              <FormLabel htmlFor="swc-jsx" ml="2" mb="0">
                JSX
              </FormLabel>
            </FormControl>
          ) : (
            <FormControl display="flex" alignItems="center">
              <Switch
                id="swc-tsx"
                isChecked={swcConfig.jsc.parser.tsx}
                onChange={handleToggleTSX}
              />
              <FormLabel htmlFor="swc-tsx" ml="2" mb="0">
                TSX
              </FormLabel>
            </FormControl>
          )}
          <FormControl display="flex" alignItems="center">
            <Switch
              id="swc-loose"
              isChecked={swcConfig.jsc.loose}
              onChange={handleToggleLoose}
            />
            <FormLabel htmlFor="swc-loose" ml="2" mb="0">
              Loose
            </FormLabel>
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <Switch
              id="swc-minify"
              isChecked={swcConfig.minify}
              onChange={handleToggleMinify}
            />
            <FormLabel htmlFor="swc-minify" ml="2" mb="0">
              Minify
            </FormLabel>
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <Switch
              id="swc-compress"
              isChecked={!!swcConfig.jsc?.minify?.compress}
              onChange={handleToggleCompress}
            />
            <FormLabel htmlFor="swc-copress" ml="2" mb="0">
              Compress
            </FormLabel>
            {swcConfig.jsc?.minify?.compress && <CompressOptionsModal />}
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <Switch
              id="swc-mangle"
              isChecked={!!swcConfig.jsc?.minify?.mangle}
              onChange={handleToggleMangle}
            />
            <FormLabel htmlFor="swc-mangle" ml="2" mb="0">
              Mangle
            </FormLabel>
            {swcConfig.jsc?.minify?.mangle && <MangleOptionsModal />}
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <Switch
              id="swc-env-targets"
              isChecked={swcConfig.env?.targets != null}
              onChange={handleToggleEnvTargets}
            />
            <FormLabel htmlFor="swc-env-targets" ml="2" mb="0">
              Env Targets
            </FormLabel>
          </FormControl>
          {typeof swcConfig.env?.targets === 'string' && (
            <>
              <FormControl display="flex" alignItems="center">
                <Input
                  display="block"
                  placeholder="Browserslist query"
                  value={swcConfig.env.targets}
                  onChange={handleEnvTargetsChange}
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <Switch
                  id="swc-env-bugfixes"
                  isChecked={swcConfig.env?.bugfixes == true}
                  onChange={handleToggleEnvBugfixes}
                />
                <FormLabel htmlFor="swc-env-bugfixes" ml="2" mb="0">
                  Bugfixes
                </FormLabel>
              </FormControl>
            </>
          )}
        </VStack>
        <ConfigEditorModal />
      </Flex>
    </Flex>
  )
}
