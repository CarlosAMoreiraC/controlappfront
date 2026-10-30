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
import { AlertCircle, Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { uiText } from '@/shared/i18n/texts'
import CustomerTypeFormDrawer from '../components/customer-type-form-drawer'
import {
  useCustomerTypes,
  useDeleteCustomerType,
} from '../hooks/use-customer-types'
import type { CustomerType } from '../types'

export function CustomerTypesPage() {
  const customerTypesQuery = useCustomerTypes()
  const deleteMutation = useDeleteCustomerType()
  const [editingType, setEditingType] = useState<CustomerType | null>(null)
  const [formOpened, setFormOpened] = useState(false)
  const [typeToDelete, setTypeToDelete] = useState<CustomerType | null>(null)

  function openCreateForm(): void {
    setEditingType(null)
    setFormOpened(true)
  }

  function openEditForm(customerType: CustomerType): void {
    setEditingType(customerType)
    setFormOpened(true)
  }

  function deleteSelectedType(): void {
    if (!typeToDelete) {
      return
    }

    deleteMutation.mutate(typeToDelete.id, {
      onSuccess: () => {
        notifications.show({
          color: 'teal',
          message: uiText.common.successDelete,
        })
        setTypeToDelete(null)
      },
    })
  }

  return (
    <>
      <section className="module-page organization-page">
        <div className="organization-page-heading">
          <div>
            <span className="section-kicker">
              {uiText.customerTypes.section}
            </span>
            <h2>{uiText.customerTypes.title}</h2>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCreateForm}>
            {uiText.customerTypes.create}
          </Button>
        </div>

        {customerTypesQuery.isPending ? (
          <div className="organization-query-state" role="status">
            <Loader size="sm" />
            <span>{uiText.common.loading}</span>
          </div>
        ) : customerTypesQuery.isError ? (
          <Alert
            color="red"
            icon={<AlertCircle size={18} />}
            title={uiText.customerTypes.loadError}
          >
            {customerTypesQuery.error.message}
          </Alert>
        ) : customerTypesQuery.data.length === 0 ? (
          <div className="module-empty-state">
            <span className="module-empty-icon module-empty-icon-teal">
              <Tags size={22} />
            </span>
            <p>{uiText.customerTypes.empty}</p>
            <Button onClick={openCreateForm} variant="light">
              {uiText.customerTypes.create}
            </Button>
          </div>
        ) : (
          <div className="organization-table-wrap">
            <Table.ScrollContainer minWidth={560}>
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{uiText.customerTypes.name}</Table.Th>
                    <Table.Th>{uiText.customerTypes.discountPercent}</Table.Th>
                    <Table.Th>{uiText.common.actions}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {customerTypesQuery.data.map((customerType) => (
                    <Table.Tr key={customerType.id}>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {customerType.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>{customerType.discountPercent}%</Table.Td>
                      <Table.Td>
                        <Group gap={6}>
                          <Tooltip label={uiText.common.edit}>
                            <ActionIcon
                              aria-label={`${uiText.common.edit} ${customerType.name}`}
                              onClick={() => openEditForm(customerType)}
                              variant="subtle"
                            >
                              <Pencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={uiText.common.delete}>
                            <ActionIcon
                              aria-label={`${uiText.common.delete} ${customerType.name}`}
                              color="red"
                              onClick={() => setTypeToDelete(customerType)}
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
        <CustomerTypeFormDrawer
          key={editingType?.id ?? 'new-customer-type'}
          customerType={editingType}
          onClose={() => setFormOpened(false)}
          opened={formOpened}
        />
      )}

      <Modal
        centered
        onClose={() => setTypeToDelete(null)}
        opened={typeToDelete !== null}
        title={uiText.customerTypes.deleteTitle}
      >
        <Stack gap="md">
          <Text size="sm">
            {uiText.customerTypes.deleteMessage}{' '}
            <strong>{typeToDelete?.name}</strong>
          </Text>
          <Text c="dimmed" size="xs">
            {uiText.common.deleteMessage}
          </Text>
          <Group justify="flex-end">
            <Button onClick={() => setTypeToDelete(null)} variant="default">
              {uiText.common.cancel}
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={deleteSelectedType}
            >
              {uiText.common.delete}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
