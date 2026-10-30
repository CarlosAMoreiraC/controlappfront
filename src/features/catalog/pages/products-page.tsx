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
import { AlertCircle, Pencil, Plus, Package, Trash2 } from 'lucide-react'
import { uiText } from '@/shared/i18n/texts'
import ProductFormDrawer from '../components/product-form-drawer'
import { useDeleteProduct, useProducts } from '../hooks/use-products'
import type { Product } from '../types'

function ProductsPage() {
  const productsQuery = useProducts()
  const deleteMutation = useDeleteProduct()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formOpened, setFormOpened] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  function openCreateForm(): void {
    setEditingProduct(null)
    setFormOpened(true)
  }

  function openEditForm(product: Product): void {
    setEditingProduct(product)
    setFormOpened(true)
  }

  function deleteSelectedProduct(): void {
    if (!productToDelete) {
      return
    }

    deleteMutation.mutate(productToDelete.id, {
      onSuccess: () => {
        notifications.show({
          color: 'teal',
          message: uiText.common.successDelete,
        })
        setProductToDelete(null)
      },
    })
  }

  return (
    <>
      <section className="module-page organization-page">
        <div className="organization-page-heading">
          <div>
            <span className="section-kicker">
              {uiText.catalog.products.section}
            </span>
            <h2>{uiText.catalog.products.title}</h2>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCreateForm}>
            {uiText.catalog.products.create}
          </Button>
        </div>

        {productsQuery.isPending ? (
          <div className="organization-query-state" role="status">
            <Loader size="sm" />
            <span>{uiText.common.loading}</span>
          </div>
        ) : productsQuery.isError ? (
          <Alert
            color="red"
            icon={<AlertCircle size={18} />}
            title={uiText.catalog.products.loadError}
          >
            {productsQuery.error.message}
          </Alert>
        ) : productsQuery.data.length === 0 ? (
          <div className="module-empty-state">
            <span className="module-empty-icon">
              <Package size={22} />
            </span>
            <p>{uiText.catalog.products.empty}</p>
            <Button onClick={openCreateForm} variant="light">
              {uiText.catalog.products.create}
            </Button>
          </div>
        ) : (
          <div className="organization-table-wrap">
            <Table.ScrollContainer minWidth={720}>
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{uiText.catalog.products.tnsCode}</Table.Th>
                    <Table.Th>{uiText.catalog.products.name}</Table.Th>
                    <Table.Th>{uiText.catalog.products.unit}</Table.Th>
                    <Table.Th>{uiText.catalog.products.vatPercent}</Table.Th>
                    <Table.Th>{uiText.common.status}</Table.Th>
                    <Table.Th>{uiText.common.actions}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {productsQuery.data.map((product) => (
                    <Table.Tr key={product.id}>
                      <Table.Td>{product.tnsCode}</Table.Td>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {product.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>{product.unit}</Table.Td>
                      <Table.Td>{product.vatPercent}%</Table.Td>
                      <Table.Td>
                        <Badge
                          color={product.active ? 'teal' : 'gray'}
                          radius="sm"
                          variant="light"
                        >
                          {product.active
                            ? uiText.common.active
                            : uiText.common.inactive}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={6}>
                          <Tooltip label={uiText.common.edit}>
                            <ActionIcon
                              aria-label={`${uiText.common.edit} ${product.name}`}
                              onClick={() => openEditForm(product)}
                              variant="subtle"
                            >
                              <Pencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={uiText.common.delete}>
                            <ActionIcon
                              aria-label={`${uiText.common.delete} ${product.name}`}
                              color="red"
                              onClick={() => setProductToDelete(product)}
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
        <ProductFormDrawer
          key={editingProduct?.id ?? 'new-product'}
          onClose={() => setFormOpened(false)}
          opened={formOpened}
          product={editingProduct}
        />
      )}

      <Modal
        centered
        onClose={() => setProductToDelete(null)}
        opened={productToDelete !== null}
        title={uiText.catalog.products.deleteTitle}
      >
        <Stack gap="md">
          <Text size="sm">
            {uiText.catalog.products.deleteMessage}{' '}
            <strong>{productToDelete?.name}</strong>
          </Text>
          <Text c="dimmed" size="xs">
            {uiText.common.deleteMessage}
          </Text>
          <Group justify="flex-end">
            <Button onClick={() => setProductToDelete(null)} variant="default">
              {uiText.common.cancel}
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={deleteSelectedProduct}
            >
              {uiText.common.delete}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

export default ProductsPage
