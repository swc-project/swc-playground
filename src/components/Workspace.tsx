import { HStack } from '@chakra-ui/react'
import Configuration from './Configuration'
import InputEditor from './InputEditor'
import OutputEditor from './OutputEditor'

export default function Workspace() {
  return (
    <HStack spacing="24px" height="88vh" mt="3" px="8">
      <Configuration />
      <InputEditor />
      <OutputEditor />
    </HStack>
  )
}
