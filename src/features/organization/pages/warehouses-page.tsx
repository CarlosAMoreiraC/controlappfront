import { useState } from 'react'
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  AlertCircle,
  Pencil,
  Plus,
  Trash2,
  Warehouse as WarehouseIcon,
} from 'lucide-react'
import { uiText } from '@/shared/i18n/texts'
import WarehouseFormDrawer from '../components/warehouse-form-drawer'
import { useSites } from '../hooks/use-sites'
import { useDeleteWarehouse, useWarehouses } from '../hooks/use-warehouses'
import type { Warehouse } from '../types'

export function WarehousesPage() {
  const [filterSiteId, setFilterSiteId] = useState<number | null>(null)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null,
  )
  const [formOpened, setFormOpened] = useState(false)
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(
    null,
  )
  const sitesQuery = useSites()
  const warehousesQuery = useWarehouses(filterSiteId ?? undefined)
  const deleteMutation = useDeleteWarehouse()
  const sites = sitesQuery.data ?? []
  const siteOptions = sites.map((site) => ({
    value: String(site.id),
    label: site.name,
  }))

  function openCreateForm(): void {
    setEditingWarehouse(null)
    setFormOpened(true)
  }

  function openEditForm(warehouse: Warehouse): void {
    setEditingWarehouse(warehouse)
    setFormOpened(true)
  }

  function deleteSelectedWarehouse(): void {
    if (!warehouseToDelete) {
      return
    }

    deleteMutation.mutate(warehouseToDelete.id, {
      onSuccess: () => {
        notifications.show({
          color: 'teal',
          message: uiText.common.successDelete,
        })
        setWarehouseToDelete(null)
      },
    })
  }

  return (
    <>
      <section className="module-page organization-page">
        <div className="organization-page-heading">
          <div>
            <span className="section-kicker">{uiText.warehouses.section}</span>
            <h2>{uiText.warehouses.title}</h2>
          </div>
          <Button
            disabled={sites.length === 0}
            leftSection={<Plus size={16} />}
            onClick={openCreateForm}
          >
            {uiText.warehouses.create}
          </Button>
        </div>

        <div className="organization-toolbar">
          <span className="toolbar-caption">
            {uiText.warehouses.siteFilter}
          </span>
          <Select
            aria-label={uiText.warehouses.siteFilter}
            clearable
            data={siteOptions}
            disabled={sites.length === 0}
            onChange={(value) =>
              setFilterSiteId(value === null ? null : Number(value))
            }
            placeholder={uiText.warehouses.allSites}
            value={filterSiteId === null ? null : String(filterSiteId)}
          />
        </div>

        {sitesQuery.isError && (
          <Alert
            className="organization-alert"
            color="red"
            icon={<AlertCircle size={18} />}
          >
            {sitesQuery.error.message}
          </Alert>
        )}

        {sites.length === 0 && !sitesQuery.isPending && !sitesQuery.isError && (
          <Alert
            className="organization-alert"
            color="blue"
            icon={<AlertCircle size={18} />}
          >
            {uiText.warehouses.noSites}
          </Alert>
        )}

        {warehousesQuery.isPending ? (
          <div className="organization-query-state" role="status">
            <Loader size="sm" />
            <span>{uiText.common.loading}</span>
          </div>
        ) : warehousesQuery.isError ? (
          <Alert
            color="red"
            icon={<AlertCircle size={18} />}
            title={uiText.warehouses.loadError}
          >
            {warehousesQuery.error.message}
          </Alert>
        ) : warehousesQuery.data.length === 0 ? (
          <div className="module-empty-state">
            <span className="module-empty-icon">
              <WarehouseIcon size={22} />
            </span>
            <p>{uiText.warehouses.empty}</p>
            {sites.length > 0 && (
              <Button onClick={openCreateForm} variant="light">
                {uiText.warehouses.create}
              </Button>
            )}
          </div>
        ) : (
          <div className="organization-table-wrap">
            <Table.ScrollContainer minWidth={720}>
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{uiText.warehouses.name}</Table.Th>
                    <Table.Th>{uiText.warehouses.site}</Table.Th>
                    <Table.Th>{uiText.warehouses.tnsCode}</Table.Th>
                    <Table.Th>{uiText.common.status}</Table.Th>
                    <Table.Th>{uiText.common.actions}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {warehousesQuery.data.map((warehouse) => {
                    const siteName = sites.find(
                      (site) => site.id === warehouse.siteId,
                    )?.name

                    return (
                      <Table.Tr key={warehouse.id}>
                        <Table.Td>
                          <Text fw={600} size="sm">
                            {warehouse.name}
                          </Text>
                        </Table.Td>
                        <Table.Td>{siteName ?? warehouse.siteId}</Table.Td>
                        <Table.Td>{warehouse.tnsCode || '—'}</Table.Td>
                        <Table.Td>
                          <Badge
                            color={warehouse.active ? 'teal' : 'gray'}
                            radius="sm"
                            variant="light"
                          >
                            {warehouse.active
                              ? uiText.common.active
                              : uiText.common.inactive}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={6}>
                            <Tooltip label={uiText.common.edit}>
                              <ActionIcon
                                aria-label={`${uiText.common.edit} ${warehouse.name}`}
                                onClick={() => openEditForm(warehouse)}
                                variant="subtle"
                              >
                                <Pencil size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label={uiText.common.delete}>
                              <ActionIcon
                                aria-label={`${uiText.common.delete} ${warehouse.name}`}
                                color="red"
                                onClick={() => setWarehouseToDelete(warehouse)}
                                variant="subtle"
                              >
                                <Trash2 size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </div>
        )}
      </section>

      {formOpened && (
        <WarehouseFormDrawer
          key={editingWarehouse?.id ?? 'new-warehouse'}
          defaultSiteId={filterSiteId}
          onClose={() => setFormOpened(false)}
          opened={formOpened}
          sites={sites}
          warehouse={editingWarehouse}
        />
      )}

      <Modal
        centered
        onClose={() => setWarehouseToDelete(null)}
        opened={warehouseToDelete !== null}
        title={uiText.warehouses.deleteTitle}
      >
        <Stack gap="md">
          <Text size="sm">
            {uiText.warehouses.deleteMessage}{' '}
            <strong>{warehouseToDelete?.name}</strong>
          </Text>
          <Text c="dimmed" size="xs">
            {uiText.common.deleteMessage}
          </Text>
          <Group justify="flex-end">
            <Button
              onClick={() => setWarehouseToDelete(null)}
              variant="default"
            >
              {uiText.common.cancel}
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={deleteSelectedWarehouse}
            >
              {uiText.common.delete}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
