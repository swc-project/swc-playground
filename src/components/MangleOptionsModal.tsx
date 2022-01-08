import { useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Button,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { swcConfigAtom } from '../state'
import type { MangleOptions } from '../swc'

export default function MangleOptionsModal() {
  const [swcConfig, setSwcConfig] = useAtom(swcConfigAtom)
  const [options, setOptions] = useState<MangleOptions | boolean | undefined>(
    swcConfig.jsc?.minify?.mangle
  )
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleApply = () => {
    setSwcConfig((config) => ({
      ...config,
      jsc: { ...config.jsc, minify: { ...config.jsc.minify, mangle: options } },
    }))
    onClose()
  }

  const handleOpen = () => {
    setOptions(swcConfig.jsc?.minify?.mangle)
    onOpen()
  }

  const handleClose = () => {
    setOptions(swcConfig.jsc?.minify?.mangle)
    onClose()
  }

  if (!options) {
    return null
  }

  const handleOptionChange = (
    key: keyof MangleOptions,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setOptions((options) =>
      options && typeof options === 'object'
        ? { ...options, [key]: event.target.checked }
        : options
    )
  }

  return (
    <>
      <Button size="xs" onClick={handleOpen}>
        More
      </Button>
      <Modal isCentered isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mangle Options</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Text mb="4">
              Not all options are shown here. You can also configure by closing
              this dialog then clicking the &quot;Edit as JSON&quot; button.
            </Text>
            <VStack align="flex-start">
              {Object.entries(options).map(([key, value]) => (
                <Checkbox
                  key={key}
                  isChecked={value}
                  onChange={(event) =>
                    handleOptionChange(key as keyof MangleOptions, event)
                  }
                >
                  {key}
                </Checkbox>
              ))}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleApply}>
              Apply
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
