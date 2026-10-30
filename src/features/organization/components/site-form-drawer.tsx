import { useForm } from '@mantine/form'
import { Button, Drawer, Group, Stack, Switch, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { AppError, mapFieldErrorsToForm } from '@/shared/api'
import { FormErrorAlert } from '@/shared/components/form-error-alert'
import { uiText } from '@/shared/i18n/texts'
import { useCreateSite, useUpdateSite } from '../hooks/use-sites'
import type { Site, SitePayload } from '../types'

interface SiteFormDrawerProps {
  opened: boolean
  site: Site | null
  onClose: () => void
}

function SiteFormDrawer({ opened, site, onClose }: SiteFormDrawerProps) {
  const createMutation = useCreateSite()
  const updateMutation = useUpdateSite()
  const form = useForm<SitePayload>({
    initialValues: {
      name: site?.name ?? '',
      active: site?.active ?? true,
    },
    validate: {
      name: (value) => (value.length > 0 ? null : uiText.common.required),
    },
  })
  const isPending = createMutation.isPending || updateMutation.isPending

  function handleError(error: Error): void {
    if (error instanceof AppError) {
      form.setErrors(mapFieldErrorsToForm(form.values, error.fieldErrors))
    }
  }

  const handleSubmit = form.onSubmit((payload) => {
    if (site) {
      updateMutation.mutate(
        { id: site.id, payload },
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
      title={site ? uiText.sites.editTitle : uiText.sites.createTitle}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <FormErrorAlert message={form.errors._form} />
          <TextInput
            autoFocus
            label={uiText.sites.name}
            required
            {...form.getInputProps('name')}
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

export default SiteFormDrawer
