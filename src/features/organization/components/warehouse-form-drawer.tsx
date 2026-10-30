import { useForm } from '@mantine/form'
import {
  Button,
  Drawer,
  Group,
  Select,
  Stack,
  Switch,
  TextInput,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { AppError, mapFieldErrorsToForm } from '@/shared/api'
import { FormErrorAlert } from '@/shared/components/form-error-alert'
import { uiText } from '@/shared/i18n/texts'
import { useCreateWarehouse, useUpdateWarehouse } from '../hooks/use-warehouses'
import type {
  Site,
  Warehouse,
  WarehousePayload,
  WarehouseUpdatePayload,
} from '../types'

type WarehouseFormValues = Omit<WarehousePayload, 'siteId'> & {
  siteId: string
  tnsCode: string
}

interface WarehouseFormDrawerProps {
  opened: boolean
  warehouse: Warehouse | null
  sites: Site[]
  defaultSiteId: number | null
  onClose: () => void
}

function WarehouseFormDrawer({
  opened,
  warehouse,
  sites,
  defaultSiteId,
  onClose,
}: WarehouseFormDrawerProps) {
  const createMutation = useCreateWarehouse()
  const updateMutation = useUpdateWarehouse()
  const form = useForm<WarehouseFormValues>({
    initialValues: {
      siteId: String(warehouse?.siteId ?? defaultSiteId ?? ''),
      name: warehouse?.name ?? '',
      tnsCode: warehouse?.tnsCode ?? '',
      active: warehouse?.active ?? true,
    },
    validate: {
      siteId: (value) => (value.length > 0 ? null : uiText.common.required),
      name: (value) => (value.length > 0 ? null : uiText.common.required),
    },
  })
  const isPending = createMutation.isPending || updateMutation.isPending
  const currentSiteName =
    sites.find((site) => site.id === warehouse?.siteId)?.name ??
    String(warehouse?.siteId ?? '')
  const siteOptions = sites.map((site) => ({
    value: String(site.id),
    label: site.name,
  }))

  function handleError(error: Error): void {
    if (error instanceof AppError) {
      form.setErrors(mapFieldErrorsToForm(form.values, error.fieldErrors))
    }
  }

  function getTnsCode(): string | null {
    return form.values.tnsCode.length > 0 ? form.values.tnsCode : null
  }

  const handleSubmit = form.onSubmit((values) => {
    if (warehouse) {
      const payload: WarehouseUpdatePayload = {
        name: values.name,
        tnsCode: getTnsCode(),
        active: values.active,
      }

      updateMutation.mutate(
        { id: warehouse.id, payload },
        {
          onSuccess: () => {
            notifications.show({
              color: 'teal',
              message: uiText.common.successUpdate,
            })
            onClose()
          },
          onError: handleError,
        },
      )
      return
    }

    const payload: WarehousePayload = {
      siteId: Number(values.siteId),
      name: values.name,
      tnsCode: getTnsCode(),
      active: values.active,
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        notifications.show({
          color: 'teal',
          message: uiText.common.successCreate,
        })
        onClose()
      },
      onError: handleError,
    })
  })

  return (
    <Drawer
      onClose={onClose}
      opened={opened}
      position="right"
      size={440}
      title={
        warehouse ? uiText.warehouses.editTitle : uiText.warehouses.createTitle
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <FormErrorAlert message={form.errors._form} />
          {warehouse ? (
            <TextInput
              label={uiText.warehouses.site}
              readOnly
              value={currentSiteName}
            />
          ) : (
            <Select
              data={siteOptions}
              label={uiText.warehouses.site}
              placeholder={uiText.warehouses.site}
              required
              searchable
              {...form.getInputProps('siteId')}
            />
          )}
          <TextInput
            autoFocus={!warehouse}
            label={uiText.warehouses.name}
            required
            {...form.getInputProps('name')}
          />
          <TextInput
            label={uiText.warehouses.tnsCode}
            {...form.getInputProps('tnsCode')}
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

export default WarehouseFormDrawer
