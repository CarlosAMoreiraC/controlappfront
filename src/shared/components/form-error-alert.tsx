import { Alert } from '@mantine/core'
import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface FormErrorAlertProps {
  message: ReactNode
}

export function FormErrorAlert({ message }: FormErrorAlertProps) {
  if (!message) {
    return null
  }

  return (
    <Alert color="red" icon={<AlertCircle size={18} />}>
      {message}
    </Alert>
  )
}
