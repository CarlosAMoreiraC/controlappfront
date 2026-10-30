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
import { AlertCircle, Pencil, Plus, Trash2, UsersRound } from 'lucide-react'
import { Link } from 'react-router'
import { useCurrentUser } from '@/auth'
import { usePriceLists } from '@/features/catalog'
import { useSites } from '@/features/organization'
import { uiText } from '@/shared/i18n/texts'
import CustomerFormDrawer from '../components/customer-form-drawer'
import { useCustomers, useDeleteCustomer } from '../hooks/use-customers'
import { useCustomerTypes } from '../hooks/use-customer-types'
import type { Customer } from '../types'

function CustomersPage() {
  const user = useCurrentUser()
  const customersQuery = useCustomers()
  const customerTypesQuery = useCustomerTypes()
  const sitesQuery = useSites()
  const priceListsQuery = usePriceLists()
  const deleteMutation = useDeleteCustomer()
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formOpened, setFormOpened] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  )
  const customerTypes = customerTypesQuery.data ?? []
  const sites = sitesQuery.data ?? []
  const priceLists = priceListsQuery.data ?? []

  function openCreateForm(): void {
    setEditingCustomer(null)
    setFormOpened(true)
  }

  function openEditForm(customer: Customer): void {
    setEditingCustomer(customer)
    setFormOpened(true)
  }

  function deleteSelectedCustomer(): void {
    if (!customerToDelete) {
      return
    }

    deleteMutation.mutate(customerToDelete.id, {
      onSuccess: () => {
        notifications.show({
          color: 'teal',
          message: uiText.common.successDelete,
        })
        setCustomerToDelete(null)
      },
    })
  }

  return (
    <>
      <section className="module-page organization-page">
        <div className="organization-page-heading">
          <div>
            <span className="section-kicker">{uiText.customers.section}</span>
            <h2>{uiText.customers.title}</h2>
          </div>
          <Group gap="sm">
            {user.role === 'ADMIN' && (
              <Button component={Link} to="/customers/types" variant="default">
                {uiText.customers.manageTypes}
              </Button>
            )}
            <Button leftSection={<Plus size={16} />} onClick={openCreateForm}>
              {uiText.customers.create}
            </Button>
          </Group>
        </div>

        {customersQuery.isPending ? (
          <div className="organization-query-state" role="status">
            <Loader size="sm" />
            <span>{uiText.common.loading}</span>
          </div>
        ) : customersQuery.isError ? (
          <Alert
            color="red"
            icon={<AlertCircle size={18} />}
            title={uiText.customers.loadError}
          >
            {customersQuery.error.message}
          </Alert>
        ) : customersQuery.data.length === 0 ? (
          <div className="module-empty-state">
            <span className="module-empty-icon module-empty-icon-teal">
              <UsersRound size={22} />
            </span>
            <p>{uiText.customers.empty}</p>
            <Button onClick={openCreateForm} variant="light">
              {uiText.customers.create}
            </Button>
          </div>
        ) : (
          <div className="organization-table-wrap">
            <Table.ScrollContainer minWidth={980}>
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{uiText.customers.tnsCode}</Table.Th>
                    <Table.Th>{uiText.customers.legalName}</Table.Th>
                    <Table.Th>{uiText.customers.customerType}</Table.Th>
                    <Table.Th>{uiText.customers.site}</Table.Th>
                    <Table.Th>{uiText.customers.priceList}</Table.Th>
                    <Table.Th>{uiText.common.status}</Table.Th>
                    <Table.Th>{uiText.common.actions}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {customersQuery.data.map((customer) => (
                    <Table.Tr key={customer.id}>
                      <Table.Td>{customer.tnsCode}</Table.Td>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {customer.legalName}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {customerTypes.find(
                          (type) => type.id === customer.customerTypeId,
                        )?.name ?? customer.customerTypeId}
                      </Table.Td>
                      <Table.Td>
                        {sites.find((site) => site.id === customer.siteId)
                          ?.name ?? customer.siteId}
                      </Table.Td>
                      <Table.Td>
                        {priceLists.find(
                          (priceList) => priceList.id === customer.priceListId,
                        )?.name ?? customer.priceListId}
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={customer.active ? 'teal' : 'gray'}
                          radius="sm"
                          variant="light"
                        >
                          {customer.active
                            ? uiText.common.active
                            : uiText.common.inactive}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={6}>
                          <Tooltip label={uiText.common.edit}>
                            <ActionIcon
                              aria-label={`${uiText.common.edit} ${customer.legalName}`}
                              onClick={() => openEditForm(customer)}
                              variant="subtle"
                            >
                              <Pencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={uiText.common.delete}>
                            <ActionIcon
                              aria-label={`${uiText.common.delete} ${customer.legalName}`}
                              color="red"
                              onClick={() => setCustomerToDelete(customer)}
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
        <CustomerFormDrawer
          key={editingCustomer?.id ?? 'new-customer'}
          customer={editingCustomer}
          onClose={() => setFormOpened(false)}
          opened={formOpened}
        />
      )}

      <Modal
        centered
        onClose={() => setCustomerToDelete(null)}
        opened={customerToDelete !== null}
        title={uiText.customers.deleteTitle}
      >
        <Stack gap="md">
          <Text size="sm">
            {uiText.customers.deleteMessage}{' '}
            <strong>{customerToDelete?.legalName}</strong>
          </Text>
          <Text c="dimmed" size="xs">
            {uiText.common.deleteMessage}
          </Text>
          <Group justify="flex-end">
            <Button onClick={() => setCustomerToDelete(null)} variant="default">
              {uiText.common.cancel}
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={deleteSelectedCustomer}
            >
              {uiText.common.delete}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

export default CustomersPage
