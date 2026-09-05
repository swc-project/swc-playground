import {
  Button,
  CheckboxRoot,
  CheckboxControl,
  CheckboxLabel,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { applyEdits, modify } from 'jsonc-parser'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { parsedSwcConfigAtom, swcConfigAtom } from '../state'
import type { MangleOptions } from '../swc'
import { JSONC_FORMATTING_OPTIONS } from '../utils'

export default function MangleOptionsModal() {
  const [, setSwcConfig] = useAtom(swcConfigAtom)
  const [parsedSwcConfig] = useAtom(parsedSwcConfigAtom)
  const [options, setOptions] = useState<MangleOptions | boolean | undefined>(
    parsedSwcConfig.jsc?.minify?.mangle
  )
  const { open, onOpen, onClose } = useDisclosure()

  const handleApply = () => {
    setSwcConfig((config) =>
      applyEdits(
        config,
        modify(config, ['jsc', 'minify', 'mangle'], options, {
          formattingOptions: JSONC_FORMATTING_OPTIONS,
        })
      )
    )
    onClose()
  }

  const handleOpen = () => {
    setOptions(parsedSwcConfig.jsc?.minify?.mangle)
    onOpen()
  }

  const handleClose = () => {
    setOptions(parsedSwcConfig.jsc?.minify?.mangle)
    onClose()
  }

  if (!options) {
    return null
  }

  const handleOptionChange = (
    key: keyof MangleOptions,
    event: ChangeEvent<HTMLInputElement>,
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
      <DialogRoot placement="center" open={open} onOpenChange={(e) => !e.open && handleClose()}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mangle Options</DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger />

          <DialogBody>
            <Text mb="4">
              Not all options are shown here. You can also configure by closing this dialog then
              clicking the &quot;Edit as JSON&quot; button.
            </Text>
            <VStack align="flex-start">
              {Object.entries(options).map(([key, value]) => (
                <CheckboxRoot
                  key={key}
                  checked={value}
                  onCheckedChange={(e) => handleOptionChange(key as keyof MangleOptions, { target: { checked: e.checked } } as any)}
                >
                  <CheckboxControl />
                  <CheckboxLabel>{key}</CheckboxLabel>
                </CheckboxRoot>
              ))}
            </VStack>
          </DialogBody>

          <DialogFooter>
            <Button colorScheme="blue" mr={3} onClick={handleApply}>
              Apply
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  )
}
