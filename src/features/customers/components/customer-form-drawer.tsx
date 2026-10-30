import {
  Alert,
  Button,
  Drawer,
  Group,
  Select,
  Stack,
  Switch,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { NumberInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { AlertCircle } from 'lucide-react'
import { usePriceLists } from '@/features/catalog'
import { useSites } from '@/features/organization'
import { AppError, mapFieldErrorsToForm } from '@/shared/api'
import { FormErrorAlert } from '@/shared/components/form-error-alert'
import { uiText } from '@/shared/i18n/texts'
import { useCreateCustomer, useUpdateCustomer } from '../hooks/use-customers'
import { useCustomerTypes } from '../hooks/use-customer-types'
import type { Customer, CustomerPayload } from '../types'

type CustomerFormValues = Omit<
  CustomerPayload,
  | 'customerTypeId'
  | 'siteId'
  | 'priceListId'
  | 'discountPercent'
  | 'address'
  | 'phone'
> & {
  customerTypeId: string
  siteId: string
  priceListId: string
  discountPercent: string
  address: string
  phone: string
}

interface CustomerFormDrawerProps {
  opened: boolean
  customer: Customer | null
  onClose: () => void
}

function CustomerFormDrawer({
  opened,
  customer,
  onClose,
}: CustomerFormDrawerProps) {
  const sitesQuery = useSites()
  const customerTypesQuery = useCustomerTypes()
  const priceListsQuery = usePriceLists()
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()
  const form = useForm<CustomerFormValues>({
    initialValues: {
      tnsCode: customer?.tnsCode ?? '',
      legalName: customer?.legalName ?? '',
      customerTypeId: String(customer?.customerTypeId ?? ''),
      siteId: String(customer?.siteId ?? ''),
      priceListId: String(customer?.priceListId ?? ''),
      discountPercent:
        customer?.discountPercent == null
          ? ''
          : String(customer.discountPercent),
      address: customer?.address ?? '',
      phone: customer?.phone ?? '',
      active: customer?.active ?? true,
    },
    validate: {
      tnsCode: (value) => (value.length > 0 ? null : uiText.common.required),
      legalName: (value) => (value.length > 0 ? null : uiText.common.required),
      customerTypeId: (value) =>
        value.length > 0 ? null : uiText.common.required,
      siteId: (value) => (value.length > 0 ? null : uiText.common.required),
      priceListId: (value) =>
        value.length > 0 ? null : uiText.common.required,
      discountPercent: (value) => {
        if (value.length === 0) {
          return null
        }

        const discount = Number(value)

        if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
          return uiText.customers.discountRange
        }

        return (value.split('.')[1]?.length ?? 0) <= 2
          ? null
          : uiText.customers.discountPrecision
      },
    },
  })
  const lookups = [sitesQuery, customerTypesQuery, priceListsQuery]
  const lookupError = lookups.find((query) => query.isError)
  const lookupPending = lookups.some((query) => query.isPending)
  const isPending = createMutation.isPending || updateMutation.isPending
  const siteOptions = (sitesQuery.data ?? []).map((site) => ({
    value: String(site.id),
    label: site.name,
  }))
  const customerTypeOptions = (customerTypesQuery.data ?? []).map((type) => ({
    value: String(type.id),
    label: type.name,
  }))
  const priceListOptions = (priceListsQuery.data ?? []).map((priceList) => ({
    value: String(priceList.id),
    label: priceList.name,
  }))

  function handleError(error: Error): void {
    if (error instanceof AppError) {
      form.setErrors(mapFieldErrorsToForm(form.values, error.fieldErrors))
    }
  }

  const handleSubmit = form.onSubmit((values) => {
    const payload: CustomerPayload = {
      tnsCode: values.tnsCode,
      legalName: values.legalName,
      customerTypeId: Number(values.customerTypeId),
      siteId: Number(values.siteId),
      priceListId: Number(values.priceListId),
      discountPercent:
        values.discountPercent.length > 0
          ? Number(values.discountPercent)
          : null,
      address: values.address.length > 0 ? values.address : null,
      phone: values.phone.length > 0 ? values.phone : null,
      active: values.active,
    }

    const onSuccess = () => {
      notifications.show({
        color: 'teal',
        message: customer
          ? uiText.common.successUpdate
          : uiText.common.successCreate,
      })
      onClose()
    }

    if (customer) {
      updateMutation.mutate(
        { id: customer.id, payload },
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
      size={480}
      title={
        customer ? uiText.customers.editTitle : uiText.customers.createTitle
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <FormErrorAlert message={form.errors._form} />
          {lookupError && (
            <Alert color="red" icon={<AlertCircle size={18} />}>
              {uiText.customers.lookupError} {lookupError.error.message}
            </Alert>
          )}
          <TextInput
            autoFocus
            label={uiText.customers.tnsCode}
            required
            {...form.getInputProps('tnsCode')}
          />
          <TextInput
            label={uiText.customers.legalName}
            required
            {...form.getInputProps('legalName')}
          />
          <Select
            data={customerTypeOptions}
            disabled={lookupPending || customerTypesQuery.isError}
            label={uiText.customers.customerType}
            required
            searchable
            {...form.getInputProps('customerTypeId')}
          />
          <Select
            data={siteOptions}
            disabled={lookupPending || sitesQuery.isError}
            label={uiText.customers.site}
            required
            searchable
            {...form.getInputProps('siteId')}
          />
          <Select
            data={priceListOptions}
            disabled={lookupPending || priceListsQuery.isError}
            label={uiText.customers.priceList}
            required
            searchable
            {...form.getInputProps('priceListId')}
          />
          <NumberInput
            decimalScale={2}
            label={uiText.customers.discountPercent}
            max={100}
            min={0}
            value={form.values.discountPercent}
            onChange={(value) =>
              form.setFieldValue('discountPercent', String(value))
            }
            error={form.errors.discountPercent}
          />
          <TextInput
            label={uiText.customers.address}
            {...form.getInputProps('address')}
          />
          <TextInput
            label={uiText.customers.phone}
            {...form.getInputProps('phone')}
          />
          <Switch
            label={uiText.common.active}
            {...form.getInputProps('active', { type: 'checkbox' })}
          />
          <Group justify="flex-end" mt="lg">
            <Button onClick={onClose} variant="default">
              {uiText.common.cancel}
            </Button>
            <Button
              disabled={lookupPending || Boolean(lookupError)}
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

export default CustomerFormDrawer
