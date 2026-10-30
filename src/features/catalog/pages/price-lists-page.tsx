import { useState } from 'react'
import {
  ActionIcon,
  Alert,
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
import {
  AlertCircle,
  CalendarDays,
  ListPlus,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router'
import { useSites } from '@/features/organization'
import { uiText } from '@/shared/i18n/texts'
import PriceListFormDrawer from '../components/price-list-form-drawer'
import { useDeletePriceList, usePriceLists } from '../hooks/use-price-lists'
import type { PriceList } from '../types'

function PriceListsPage() {
  const priceListsQuery = usePriceLists()
  const sitesQuery = useSites()
  const deleteMutation = useDeletePriceList()
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(
    null,
  )
  const [formOpened, setFormOpened] = useState(false)
  const [priceListToDelete, setPriceListToDelete] = useState<PriceList | null>(
    null,
  )
  const sites = sitesQuery.data ?? []

  function openCreateForm(): void {
    setEditingPriceList(null)
    setFormOpened(true)
  }

  function openEditForm(priceList: PriceList): void {
    setEditingPriceList(priceList)
    setFormOpened(true)
  }

  function deleteSelectedPriceList(): void {
    if (!priceListToDelete) {
      return
    }

    deleteMutation.mutate(priceListToDelete.id, {
      onSuccess: () => {
        notifications.show({
          color: 'teal',
          message: uiText.common.successDelete,
        })
        setPriceListToDelete(null)
      },
    })
  }

  return (
    <>
      <section className="module-page organization-page">
        <div className="organization-page-heading">
          <div>
            <span className="section-kicker">
              {uiText.catalog.priceLists.section}
            </span>
            <h2>{uiText.catalog.priceLists.title}</h2>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCreateForm}>
            {uiText.catalog.priceLists.create}
          </Button>
        </div>

        {priceListsQuery.isPending ? (
          <div className="organization-query-state" role="status">
            <Loader size="sm" />
            <span>{uiText.common.loading}</span>
          </div>
        ) : priceListsQuery.isError ? (
          <Alert
            color="red"
            icon={<AlertCircle size={18} />}
            title={uiText.catalog.priceLists.loadError}
          >
            {priceListsQuery.error.message}
          </Alert>
        ) : priceListsQuery.data.length === 0 ? (
          <div className="module-empty-state">
            <span className="module-empty-icon">
              <CalendarDays size={22} />
            </span>
            <p>{uiText.catalog.priceLists.empty}</p>
            <Button onClick={openCreateForm} variant="light">
              {uiText.catalog.priceLists.create}
            </Button>
          </div>
        ) : (
          <div className="organization-table-wrap">
            <Table.ScrollContainer minWidth={880}>
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{uiText.catalog.priceLists.name}</Table.Th>
                    <Table.Th>{uiText.catalog.priceLists.site}</Table.Th>
                    <Table.Th>{uiText.catalog.priceLists.validFrom}</Table.Th>
                    <Table.Th>{uiText.catalog.priceLists.validUntil}</Table.Th>
                    <Table.Th>{uiText.common.actions}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {priceListsQuery.data.map((priceList) => (
                    <Table.Tr key={priceList.id}>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {priceList.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {sites.find((site) => site.id === priceList.siteId)
                          ?.name ?? uiText.catalog.priceLists.noSite}
                      </Table.Td>
                      <Table.Td>{priceList.validFrom}</Table.Td>
                      <Table.Td>{priceList.validUntil ?? '—'}</Table.Td>
                      <Table.Td>
                        <Group gap={6} wrap="nowrap">
                          <Tooltip
                            label={uiText.catalog.priceLists.manageItems}
                          >
                            <ActionIcon
                              aria-label={`${uiText.catalog.priceLists.manageItems}: ${priceList.name}`}
                              component={Link}
                              to={`/catalog/price-lists/${priceList.id}/items`}
                              variant="subtle"
                            >
                              <ListPlus size={17} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={uiText.common.edit}>
                            <ActionIcon
                              aria-label={`${uiText.common.edit} ${priceList.name}`}
                              onClick={() => openEditForm(priceList)}
                              variant="subtle"
                            >
                              <Pencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={uiText.common.delete}>
                            <ActionIcon
                              aria-label={`${uiText.common.delete} ${priceList.name}`}
                              color="red"
                              onClick={() => setPriceListToDelete(priceList)}
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
        <PriceListFormDrawer
          key={editingPriceList?.id ?? 'new-price-list'}
          onClose={() => setFormOpened(false)}
          opened={formOpened}
          priceList={editingPriceList}
        />
      )}

      <Modal
        centered
        onClose={() => setPriceListToDelete(null)}
        opened={priceListToDelete !== null}
        title={uiText.catalog.priceLists.deleteTitle}
      >
        <Stack gap="md">
          <Text size="sm">
            {uiText.catalog.priceLists.deleteMessage}{' '}
            <strong>{priceListToDelete?.name}</strong>
          </Text>
          <Text c="dimmed" size="xs">
            {uiText.common.deleteMessage}
          </Text>
          <Group justify="flex-end">
            <Button
              onClick={() => setPriceListToDelete(null)}
              variant="default"
            >
              {uiText.common.cancel}
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={deleteSelectedPriceList}
            >
              {uiText.common.delete}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

export default PriceListsPage
