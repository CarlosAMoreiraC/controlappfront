import { useState } from 'react'
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { AlertCircle, Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import { uiText } from '@/shared/i18n/texts'
import SiteFormDrawer from '../components/site-form-drawer'
import { useDeleteSite, useSites } from '../hooks/use-sites'
import type { Site } from '../types'

export function SitesPage() {
  const sitesQuery = useSites()
  const deleteMutation = useDeleteSite()
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [formOpened, setFormOpened] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)

  function openCreateForm(): void {
    setEditingSite(null)
    setFormOpened(true)
  }

  function openEditForm(site: Site): void {
    setEditingSite(site)
    setFormOpened(true)
  }

  function deleteSelectedSite(): void {
    if (!siteToDelete) {
      return
    }

    deleteMutation.mutate(siteToDelete.id, {
      onSuccess: () => {
        notifications.show({
          color: 'teal',
          message: uiText.common.successDelete,
        })
        setSiteToDelete(null)
      },
    })
  }

  return (
    <>
      <section className="module-page organization-page">
        <div className="organization-page-heading">
          <div>
            <span className="section-kicker">{uiText.sites.section}</span>
            <h2>{uiText.sites.title}</h2>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCreateForm}>
            {uiText.sites.create}
          </Button>
        </div>

        {sitesQuery.isPending ? (
          <div className="organization-query-state" role="status">
            <Loader size="sm" />
            <span>{uiText.common.loading}</span>
          </div>
        ) : sitesQuery.isError ? (
          <Alert
            color="red"
            icon={<AlertCircle size={18} />}
            title={uiText.sites.loadError}
          >
            {sitesQuery.error.message}
          </Alert>
        ) : sitesQuery.data.length === 0 ? (
          <div className="module-empty-state">
            <span className="module-empty-icon">
              <Building2 size={22} />
            </span>
            <p>{uiText.sites.empty}</p>
            <Button onClick={openCreateForm} variant="light">
              {uiText.sites.create}
            </Button>
          </div>
        ) : (
          <div className="organization-table-wrap">
            <Table.ScrollContainer minWidth={560}>
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{uiText.sites.name}</Table.Th>
                    <Table.Th>{uiText.common.status}</Table.Th>
                    <Table.Th>{uiText.common.actions}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sitesQuery.data.map((site) => (
                    <Table.Tr key={site.id}>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {site.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={site.active ? 'teal' : 'gray'}
                          radius="sm"
                          variant="light"
                        >
                          {site.active
                            ? uiText.common.active
                            : uiText.common.inactive}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={6}>
                          <Tooltip label={uiText.common.edit}>
                            <ActionIcon
                              aria-label={`${uiText.common.edit} ${site.name}`}
                              onClick={() => openEditForm(site)}
                              variant="subtle"
                            >
                              <Pencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={uiText.common.delete}>
                            <ActionIcon
                              aria-label={`${uiText.common.delete} ${site.name}`}
                              color="red"
                              onClick={() => setSiteToDelete(site)}
                              variant="subtle"
                            >
                              <Trash2 size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </div>
        )}
      </section>

      {formOpened && (
        <SiteFormDrawer
          key={editingSite?.id ?? 'new-site'}
          onClose={() => setFormOpened(false)}
          opened={formOpened}
          site={editingSite}
        />
      )}

      <Modal
        centered
        onClose={() => setSiteToDelete(null)}
        opened={siteToDelete !== null}
        title={uiText.sites.deleteTitle}
      >
        <Stack gap="md">
          <Text size="sm">
            {uiText.sites.deleteMessage} <strong>{siteToDelete?.name}</strong>
          </Text>
          <Text c="dimmed" size="xs">
            {uiText.common.deleteMessage}
          </Text>
          <Group justify="flex-end">
            <Button onClick={() => setSiteToDelete(null)} variant="default">
              {uiText.common.cancel}
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={deleteSelectedSite}
            >
              {uiText.common.delete}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
