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
  Field,
  Grid,
  NumberInputInput,
  NumberInputRoot,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { applyEdits, modify } from 'jsonc-parser'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { parsedSwcConfigAtom, swcConfigAtom } from '../state'
import type { CompressOptions } from '../swc'
import { JSONC_FORMATTING_OPTIONS } from '../utils'

export default function CompressOptionsModal() {
  const [, setSwcConfig] = useAtom(swcConfigAtom)
  const [parsedSwcConfig] = useAtom(parsedSwcConfigAtom)
  const [options, setOptions] = useState<CompressOptions | boolean | undefined>(
    parsedSwcConfig.jsc?.minify?.compress
  )
  const { open, onOpen, onClose } = useDisclosure()

  const handleApply = () => {
    setSwcConfig((config) =>
      applyEdits(
        config,
        modify(config, ['jsc', 'minify', 'compress'], options, {
          formattingOptions: JSONC_FORMATTING_OPTIONS,
        })
      )
    )
    onClose()
  }

  const handleOpen = () => {
    setOptions(parsedSwcConfig.jsc?.minify?.compress)
    onOpen()
  }

  const handleClose = () => {
    setOptions(parsedSwcConfig.jsc?.minify?.compress)
    onClose()
  }

  if (!options) {
    return null
  }

  const handleOptionChange = (
    key: keyof CompressOptions,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setOptions((options) =>
      options && typeof options === 'object'
        ? { ...options, [key]: event.target.checked }
        : options
    )
  }

  const handlePassesChange = (value: number) => {
    setOptions((options) =>
      options && typeof options === 'object'
        ? { ...options, passes: value }
        : options
    )
  }

  return (
    <>
      <Button size="xs" onClick={handleOpen}>
        More
      </Button>
      <DialogRoot
        placement="center"
        scrollBehavior="inside"
        size="xl"
        open={open}
        onOpenChange={(e) => !e.open && handleClose()}
      >
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compress Options</DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger />

          <DialogBody>
            <Text mb="4">
              Not all options are shown here. You can also configure by closing this dialog then
              clicking the &quot;Edit as JSON&quot; button.
            </Text>
            <Grid
              templateColumns={['1fr', '1fr', 'repeat(3, 1fr)']}
              rowGap="2"
              columnGap="2"
            >
              {Object.entries(options)
                .filter(([, value]) => typeof value === 'boolean')
                .map(([key, value]) => (
                  <CheckboxRoot
                    key={key}
                    checked={value}
                    onCheckedChange={(e) => handleOptionChange(key as keyof CompressOptions, { target: { checked: e.checked } } as any)}
                  >
                    <CheckboxControl />
                    <CheckboxLabel>{key}</CheckboxLabel>
                  </CheckboxRoot>
                ))}
            </Grid>
            {options && typeof options === 'object' && (
              <Field.Root w={1 / 3}>
                <Field.Label>Passes</Field.Label>
                <NumberInputRoot
                  defaultValue="3"
                  min={0}
                  value={options.passes?.toString()}
                  onValueChange={(details) => handlePassesChange(details.valueAsNumber)}
                >
                  <NumberInputInput />
                </NumberInputRoot>
              </Field.Root>
            )}
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
