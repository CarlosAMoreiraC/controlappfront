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
  ArrowLeft,
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { Link, useParams } from 'react-router'
import { uiText } from '@/shared/i18n/texts'
import PriceListItemFormDrawer from '../components/price-list-item-form-drawer'
import {
  useDeletePriceListItem,
  usePriceListItems,
  usePriceLists,
} from '../hooks/use-price-lists'
import { useProducts } from '../hooks/use-products'
import type { PriceListItem } from '../types'

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 2,
})

function PriceListItemsPage() {
  const { priceListId: routePriceListId } = useParams()
  const priceListId = Number(routePriceListId)
  const hasValidPriceListId = Number.isInteger(priceListId) && priceListId > 0
  const itemsQuery = usePriceListItems(hasValidPriceListId ? priceListId : 0)
  const priceListsQuery = usePriceLists()
  const productsQuery = useProducts()
  const deleteMutation = useDeletePriceListItem(priceListId)
  const [editingItem, setEditingItem] = useState<PriceListItem | null>(null)
  const [formOpened, setFormOpened] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<PriceListItem | null>(null)
  const priceList = priceListsQuery.data?.find(
    (item) => item.id === priceListId,
  )
  const products = productsQuery.data ?? []

  function openCreateForm(): void {
    setEditingItem(null)
    setFormOpened(true)
  }

  function openEditForm(item: PriceListItem): void {
    setEditingItem(item)
    setFormOpened(true)
  }

  function deleteSelectedItem(): void {
    if (!itemToDelete) {
      return
    }

    deleteMutation.mutate(itemToDelete.id, {
      onSuccess: () => {
        notifications.show({
          color: 'teal',
          message: uiText.common.successDelete,
        })
        setItemToDelete(null)
      },
    })
  }

  if (!hasValidPriceListId) {
    return (
      <Alert color="red" icon={<AlertCircle size={18} />}>
        {uiText.catalog.priceLists.loadError}
      </Alert>
    )
  }

  return (
    <>
      <section className="module-page organization-page">
        <div className="organization-page-heading">
          <div>
            <span className="section-kicker">
              {uiText.catalog.priceListItems.section}
            </span>
            <h2>{priceList?.name ?? uiText.catalog.priceListItems.title}</h2>
          </div>
          <Group gap="sm">
            <Button
              component={Link}
              leftSection={<ArrowLeft size={16} />}
              to="/catalog/price-lists"
              variant="default"
            >
              {uiText.catalog.priceLists.title}
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={openCreateForm}>
              {uiText.catalog.priceListItems.create}
            </Button>
          </Group>
        </div>

        {itemsQuery.isPending ? (
          <div className="organization-query-state" role="status">
            <Loader size="sm" />
            <span>{uiText.common.loading}</span>
          </div>
        ) : itemsQuery.isError ? (
          <Alert
            color="red"
            icon={<AlertCircle size={18} />}
            title={uiText.catalog.priceListItems.loadError}
          >
            {itemsQuery.error.message}
          </Alert>
        ) : itemsQuery.data.length === 0 ? (
          <div className="module-empty-state">
            <span className="module-empty-icon">
              <CalendarDays size={22} />
            </span>
            <p>{uiText.catalog.priceListItems.empty}</p>
            <Button onClick={openCreateForm} variant="light">
              {uiText.catalog.priceListItems.create}
            </Button>
          </div>
        ) : (
          <div className="organization-table-wrap">
            <Table.ScrollContainer minWidth={720}>
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{uiText.catalog.priceListItems.product}</Table.Th>
                    <Table.Th>{uiText.catalog.priceListItems.price}</Table.Th>
                    <Table.Th>
                      {uiText.catalog.priceListItems.validFrom}
                    </Table.Th>
                    <Table.Th>
                      {uiText.catalog.priceListItems.validUntil}
                    </Table.Th>
                    <Table.Th>{uiText.common.actions}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {itemsQuery.data.map((item) => {
                    const product = products.find(
                      (candidate) => candidate.id === item.productId,
                    )

                    return (
                      <Table.Tr key={item.id}>
                        <Table.Td>
                          <Text fw={600} size="sm">
                            {product?.name ?? item.productId}
                          </Text>
                          {product && (
                            <Text c="dimmed" size="xs">
                              {product.tnsCode}
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {currencyFormatter.format(item.price)}
                        </Table.Td>
                        <Table.Td>{item.validFrom}</Table.Td>
                        <Table.Td>{item.validUntil ?? '—'}</Table.Td>
                        <Table.Td>
                          <Group gap={6}>
                            <Tooltip label={uiText.common.edit}>
                              <ActionIcon
                                aria-label={`${uiText.common.edit} ${product?.name ?? item.productId}`}
                                onClick={() => openEditForm(item)}
                                variant="subtle"
                              >
                                <Pencil size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label={uiText.common.delete}>
                              <ActionIcon
                                aria-label={`${uiText.common.delete} ${product?.name ?? item.productId}`}
                                color="red"
                                onClick={() => setItemToDelete(item)}
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
        <PriceListItemFormDrawer
          key={editingItem?.id ?? 'new-price-list-item'}
          item={editingItem}
          onClose={() => setFormOpened(false)}
          opened={formOpened}
          priceListId={priceListId}
        />
      )}

      <Modal
        centered
        onClose={() => setItemToDelete(null)}
        opened={itemToDelete !== null}
        title={uiText.catalog.priceListItems.deleteTitle}
      >
        <Stack gap="md">
          <Text size="sm">{uiText.catalog.priceListItems.deleteMessage}</Text>
          <Text c="dimmed" size="xs">
            {uiText.common.deleteMessage}
          </Text>
          <Group justify="flex-end">
            <Button onClick={() => setItemToDelete(null)} variant="default">
              {uiText.common.cancel}
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={deleteSelectedItem}
            >
              {uiText.common.delete}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

export default PriceListItemsPage
