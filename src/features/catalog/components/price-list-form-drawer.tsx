import { Button, Drawer, Group, Select, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { AppError, mapFieldErrorsToForm } from '@/shared/api'
import { FormErrorAlert } from '@/shared/components/form-error-alert'
import { useSites } from '@/features/organization'
import { uiText } from '@/shared/i18n/texts'
import {
  useCreatePriceList,
  useUpdatePriceList,
} from '../hooks/use-price-lists'
import type { PriceList, PriceListPayload } from '../types'

interface PriceListFormDrawerProps {
  opened: boolean
  priceList: PriceList | null
  onClose: () => void
}

function PriceListFormDrawer({
  opened,
  priceList,
  onClose,
}: PriceListFormDrawerProps) {
  const sitesQuery = useSites()
  const createMutation = useCreatePriceList()
  const updateMutation = useUpdatePriceList()
  const form = useForm({
    initialValues: {
      name: priceList?.name ?? '',
      siteId: String(priceList?.siteId ?? ''),
      validFrom: priceList?.validFrom ?? '',
      validUntil: priceList?.validUntil ?? '',
    },
    validate: {
      name: (value) => (value.length > 0 ? null : uiText.common.required),
      validFrom: (value) => (value.length > 0 ? null : uiText.common.required),
    },
  })
  const siteOptions = (sitesQuery.data ?? []).map((site) => ({
    value: String(site.id),
    label: site.name,
  }))
  const isPending = createMutation.isPending || updateMutation.isPending

  function handleError(error: Error): void {
    if (error instanceof AppError) {
      form.setErrors(mapFieldErrorsToForm(form.values, error.fieldErrors))
    }
  }

  const handleSubmit = form.onSubmit((values) => {
    const payload: PriceListPayload = {
      name: values.name,
      siteId: values.siteId.length > 0 ? Number(values.siteId) : null,
      validFrom: values.validFrom,
      validUntil: values.validUntil.length > 0 ? values.validUntil : null,
    }
    const onSuccess = () => {
      notifications.show({
        color: 'teal',
        message: priceList
          ? uiText.common.successUpdate
          : uiText.common.successCreate,
      })
      onClose()
    }

    if (priceList) {
      updateMutation.mutate(
        { id: priceList.id, payload },
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
        priceList
          ? uiText.catalog.priceLists.editTitle
          : uiText.catalog.priceLists.createTitle
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <FormErrorAlert message={form.errors._form} />
          <TextInput
            autoFocus
            label={uiText.catalog.priceLists.name}
            required
            {...form.getInputProps('name')}
          />
          <Select
            clearable
            data={siteOptions}
            disabled={sitesQuery.isPending || sitesQuery.isError}
            label={uiText.catalog.priceLists.site}
            placeholder={uiText.catalog.priceLists.noSite}
            searchable
            {...form.getInputProps('siteId')}
          />
          <TextInput
            label={uiText.catalog.priceLists.validFrom}
            required
            type="date"
            {...form.getInputProps('validFrom')}
          />
          <TextInput
            label={uiText.catalog.priceLists.validUntil}
            type="date"
            {...form.getInputProps('validUntil')}
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

export default PriceListFormDrawer
