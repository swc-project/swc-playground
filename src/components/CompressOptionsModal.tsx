import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Button,
  Checkbox,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import type { ModalProps } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { swcConfigAtom } from '../state'
import type { CompressOptions } from '../state'

type Props = Pick<ModalProps, 'isOpen' | 'onClose'>

export default function CompressOptionsModal({ isOpen, onClose }: Props) {
  const [swcConfig, setSwcConfig] = useAtom(swcConfigAtom)
  const [options, setOptions] = useState<CompressOptions | false>(
    swcConfig.jsc.minify.compress
  )

  useEffect(() => {
    setOptions(swcConfig.jsc.minify.compress)
  }, [swcConfig])

  const handleApply = () => {
    setSwcConfig((config) => ({
      ...config,
      jsc: {
        ...config.jsc,
        minify: { ...config.jsc.minify, compress: options },
      },
    }))
    onClose()
  }

  const handleClose = () => {
    setOptions(swcConfig.jsc.minify.compress)
    onClose()
  }

  if (!options) {
    return null
  }

  const handleOptionChange = (
    key: keyof CompressOptions,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setOptions((options) =>
      options ? { ...options, [key]: event.target.checked } : options
    )
  }

  return (
    <Modal isCentered size="xl" isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Compress Options</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Grid templateColumns="repeat(3, 1fr)" rowGap="2" columnGap="2">
            {Object.entries(options).map(([key, value]) => (
              <Checkbox
                key={key}
                isChecked={value}
                onChange={(event) =>
                  handleOptionChange(key as keyof CompressOptions, event)
                }
              >
                {key}
              </Checkbox>
            ))}
          </Grid>
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
