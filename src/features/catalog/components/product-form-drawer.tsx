import {
  Button,
  Drawer,
  Group,
  NumberInput,
  Stack,
  Switch,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { AppError, mapFieldErrorsToForm } from '@/shared/api'
import { FormErrorAlert } from '@/shared/components/form-error-alert'
import { uiText } from '@/shared/i18n/texts'
import { useCreateProduct, useUpdateProduct } from '../hooks/use-products'
import type { Product, ProductPayload } from '../types'

interface ProductFormDrawerProps {
  opened: boolean
  product: Product | null
  onClose: () => void
}

function ProductFormDrawer({
  opened,
  product,
  onClose,
}: ProductFormDrawerProps) {
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const form = useForm({
    initialValues: {
      tnsCode: product?.tnsCode ?? '',
      name: product?.name ?? '',
      unit: product?.unit ?? '',
      vatPercent: String(product?.vatPercent ?? ''),
      active: product?.active ?? true,
    },
    validate: {
      tnsCode: (value) => (value.length > 0 ? null : uiText.common.required),
      name: (value) => (value.length > 0 ? null : uiText.common.required),
      unit: (value) => (value.length > 0 ? null : uiText.common.required),
      vatPercent: (value) => {
        const vat = Number(value)

        if (!Number.isFinite(vat) || vat < 0 || vat > 100) {
          return uiText.catalog.products.vatRange
        }

        return (value.split('.')[1]?.length ?? 0) <= 2
          ? null
          : uiText.catalog.products.precision
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
    const payload: ProductPayload = {
      tnsCode: values.tnsCode,
      name: values.name,
      unit: values.unit,
      vatPercent: Number(values.vatPercent),
      active: values.active,
    }
    const onSuccess = () => {
      notifications.show({
        color: 'teal',
        message: product
          ? uiText.common.successUpdate
          : uiText.common.successCreate,
      })
      onClose()
    }

    if (product) {
      updateMutation.mutate(
        { id: product.id, payload },
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
        product
          ? uiText.catalog.products.editTitle
          : uiText.catalog.products.createTitle
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <FormErrorAlert message={form.errors._form} />
          <TextInput
            autoFocus
            label={uiText.catalog.products.tnsCode}
            required
            {...form.getInputProps('tnsCode')}
          />
          <TextInput
            label={uiText.catalog.products.name}
            required
            {...form.getInputProps('name')}
          />
          <TextInput
            label={uiText.catalog.products.unit}
            required
            {...form.getInputProps('unit')}
          />
          <NumberInput
            decimalScale={2}
            label={uiText.catalog.products.vatPercent}
            max={100}
            min={0}
            value={form.values.vatPercent}
            onChange={(value) =>
              form.setFieldValue('vatPercent', String(value))
            }
            error={form.errors.vatPercent}
            required
          />
          <Switch
            label={uiText.common.active}
            {...form.getInputProps('active', { type: 'checkbox' })}
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

export default ProductFormDrawer
