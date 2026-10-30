import {
  Alert,
  Button,
  Drawer,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { AlertCircle } from 'lucide-react'
import { AppError, mapFieldErrorsToForm } from '@/shared/api'
import { FormErrorAlert } from '@/shared/components/form-error-alert'
import { uiText } from '@/shared/i18n/texts'
import { useProducts } from '../hooks/use-products'
import {
  useCreatePriceListItem,
  useUpdatePriceListItem,
} from '../hooks/use-price-lists'
import type { PriceListItem, PriceListItemPayload } from '../types'

interface PriceListItemFormValues {
  productId: string
  price: string
  validFrom: string
  validUntil: string
}

interface PriceListItemFormDrawerProps {
  opened: boolean
  priceListId: number
  item: PriceListItem | null
  onClose: () => void
}

function PriceListItemFormDrawer({
  opened,
  priceListId,
  item,
  onClose,
}: PriceListItemFormDrawerProps) {
  const productsQuery = useProducts()
  const createMutation = useCreatePriceListItem(priceListId)
  const updateMutation = useUpdatePriceListItem(priceListId)
  const form = useForm<PriceListItemFormValues>({
    initialValues: {
      productId: String(item?.productId ?? ''),
      price: item === null ? '' : String(item.price),
      validFrom: item?.validFrom ?? '',
      validUntil: item?.validUntil ?? '',
    },
    validate: {
      productId: (value) => (value.length > 0 ? null : uiText.common.required),
      price: (value) => {
        const price = Number(value)

        if (!Number.isFinite(price) || price < 0) {
          return uiText.catalog.priceListItems.minimum
        }

        return (value.split('.')[1]?.length ?? 0) <= 2
          ? null
          : uiText.catalog.priceListItems.precision
      },
      validFrom: (value) => (value.length > 0 ? null : uiText.common.required),
    },
  })
  const productOptions = (productsQuery.data ?? []).map((product) => ({
    value: String(product.id),
    label: `${product.tnsCode} · ${product.name}`,
  }))
  const isPending = createMutation.isPending || updateMutation.isPending

  function handleError(error: Error): void {
    if (error instanceof AppError) {
      form.setErrors(mapFieldErrorsToForm(form.values, error.fieldErrors))
    }
  }

  const handleSubmit = form.onSubmit((values) => {
    const payload: PriceListItemPayload = {
      productId: Number(values.productId),
      price: Number(values.price),
      validFrom: values.validFrom,
      validUntil: values.validUntil.length > 0 ? values.validUntil : null,
    }
    const onSuccess = () => {
      notifications.show({
        color: 'teal',
        message: item
          ? uiText.common.successUpdate
          : uiText.common.successCreate,
      })
      onClose()
    }

    if (item) {
      updateMutation.mutate(
        { id: item.id, payload },
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
        item
          ? uiText.catalog.priceListItems.editTitle
          : uiText.catalog.priceListItems.createTitle
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <FormErrorAlert message={form.errors._form} />
          {productsQuery.isError && (
            <Alert color="red" icon={<AlertCircle size={18} />}>
              {productsQuery.error.message}
            </Alert>
          )}
          <Select
            data={productOptions}
            disabled={productsQuery.isPending || productsQuery.isError}
            label={uiText.catalog.priceListItems.product}
            required
            searchable
            {...form.getInputProps('productId')}
          />
          <NumberInput
            decimalScale={2}
            label={uiText.catalog.priceListItems.price}
            min={0}
            value={form.values.price}
            onChange={(value) => form.setFieldValue('price', String(value))}
            error={form.errors.price}
            required
          />
          <TextInput
            label={uiText.catalog.priceListItems.validFrom}
            required
            type="date"
            {...form.getInputProps('validFrom')}
          />
          <TextInput
            label={uiText.catalog.priceListItems.validUntil}
            type="date"
            {...form.getInputProps('validUntil')}
          />
          <Group justify="flex-end" mt="lg">
            <Button onClick={onClose} variant="default">
              {uiText.common.cancel}
            </Button>
            <Button
              disabled={productsQuery.isPending || productsQuery.isError}
              loading={isPending}
              type="submit"
            >
              {isPending ? uiText.common.saving : uiText.common.save}
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  )
}

export default PriceListItemFormDrawer
