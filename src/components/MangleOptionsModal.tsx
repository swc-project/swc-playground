import { useEffect, useState } from 'react'
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
  VStack,
} from '@chakra-ui/react'
import type { ModalProps } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { MangleOptions, swcConfigAtom } from '../state'

type Props = Pick<ModalProps, 'isOpen' | 'onClose'>

export default function MangleOptionsModal({ isOpen, onClose }: Props) {
  const [swcConfig, setSwcConfig] = useAtom(swcConfigAtom)
  const [options, setOptions] = useState<MangleOptions | false>(
    swcConfig.jsc.minify.mangle
  )

  useEffect(() => {
    setOptions(swcConfig.jsc.minify.mangle)
  }, [swcConfig])

  const handleApply = () => {
    setSwcConfig((config) => ({
      ...config,
      jsc: { ...config.jsc, minify: { ...config.jsc.minify, mangle: options } },
    }))
    onClose()
  }

  const handleClose = () => {
    setOptions(swcConfig.jsc.minify.mangle)
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
      options ? { ...options, [key]: event.target.checked } : options
    )
  }

  return (
    <Modal isCentered isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Mangle Options</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
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
  )
}
