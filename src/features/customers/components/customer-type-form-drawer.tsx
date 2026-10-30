import {
  Button,
  Drawer,
  Group,
  NumberInput,
  Stack,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { AppError, mapFieldErrorsToForm } from '@/shared/api'
import { FormErrorAlert } from '@/shared/components/form-error-alert'
import { uiText } from '@/shared/i18n/texts'
import {
  useCreateCustomerType,
  useUpdateCustomerType,
} from '../hooks/use-customer-types'
import type { CustomerType, CustomerTypePayload } from '../types'

interface CustomerTypeFormDrawerProps {
  opened: boolean
  customerType: CustomerType | null
  onClose: () => void
}

function CustomerTypeFormDrawer({
  opened,
  customerType,
  onClose,
}: CustomerTypeFormDrawerProps) {
  const createMutation = useCreateCustomerType()
  const updateMutation = useUpdateCustomerType()
  const form = useForm({
    initialValues: {
      name: customerType?.name ?? '',
      discountPercent:
        customerType === null ? '' : String(customerType.discountPercent),
    },
    validate: {
      name: (value) => (value.length > 0 ? null : uiText.common.required),
      discountPercent: (value) => {
        if (value.length === 0) {
          return uiText.common.required
        }

        const discount = Number(value)

        if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
          return uiText.customerTypes.discountRange
        }

        return (value.split('.')[1]?.length ?? 0) <= 2
          ? null
          : uiText.customerTypes.discountPrecision
      },
    },
  })
  const isPending = createMutation.isPending || updateMutation.isPending

  function handleError(error: Error): void {
    if (error instanceof AppError) {
      form.setErrors(mapFieldErrorsToForm(form.values, error.fieldErrors))
    }
  }

  const handleSubmit = form.onSubmit((values) => {
    const payload: CustomerTypePayload = {
      name: values.name,
      discountPercent: Number(values.discountPercent),
    }
    const onSuccess = () => {
      notifications.show({
        color: 'teal',
        message: customerType
          ? uiText.common.successUpdate
          : uiText.common.successCreate,
      })
      onClose()
    }

    if (customerType) {
      updateMutation.mutate(
        { id: customerType.id, payload },
        { onSuccess, onError: handleError },
      )
      return
    }

    createMutation.mutate(payload, { onSuccess, onError: handleError })
  })

  return (
    <Drawer
      onClose={onClose}
      opened={opened}
      position="right"
      size={440}
      title={
        customerType
          ? uiText.customerTypes.editTitle
          : uiText.customerTypes.createTitle
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <FormErrorAlert message={form.errors._form} />
          <TextInput
            autoFocus
            label={uiText.customerTypes.name}
            required
            {...form.getInputProps('name')}
          />
          <NumberInput
            decimalScale={2}
            label={uiText.customerTypes.discountPercent}
            max={100}
            min={0}
            value={form.values.discountPercent}
            onChange={(value) =>
              form.setFieldValue('discountPercent', String(value))
            }
            error={form.errors.discountPercent}
            required
          />
          <Group justify="flex-end" mt="lg">
            <Button onClick={onClose} variant="default">
              {uiText.common.cancel}
            </Button>
            <Button loading={isPending} type="submit">
              {isPending ? uiText.common.saving : uiText.common.save}
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  )
}

export default CustomerTypeFormDrawer
