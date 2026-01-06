import React, { useState, useRef } from 'react'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'
import { Query } from 'react-apollo'
import GET_VOUCHERS from './graphql/queries/get-vouchers.gql'
import { VouchersTable, CreateVoucherModal, VoucherDetailsModal } from './components'
import './styles.global.css'

const AdminGiftCardManager: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const refetchRef = useRef<(() => void) | null>(null)

  const handleRowClick = (voucher: { id: string }) => {
    setSelectedVoucherId(voucher.id)
    setIsDetailsModalOpen(true)
  }

  const handleCreateSuccess = () => {
    if (refetchRef.current) {
      refetchRef.current()
    }
  }

  return (
    <Layout
      pageHeader={
        <PageHeader
          title="Gift Cards Manager"
          linkLabel="Create New"
          onLinkClick={() => setIsCreateModalOpen(true)}
        />
      }
    >
      <PageBlock variation="full">
        <Query query={GET_VOUCHERS}>
          {({ data, loading, refetch }: any) => {
            const vouchers = data?.vouchers || []
            refetchRef.current = refetch

            return (
              <>
                <VouchersTable
                  vouchers={vouchers}
                  loading={loading}
                  onRowClick={handleRowClick}
                />
                <CreateVoucherModal
                  isOpen={isCreateModalOpen}
                  onClose={() => setIsCreateModalOpen(false)}
                  onSuccess={handleCreateSuccess}
                />
                <VoucherDetailsModal
                  isOpen={isDetailsModalOpen}
                  voucherId={selectedVoucherId}
                  onClose={() => {
                    setIsDetailsModalOpen(false)
                    setSelectedVoucherId(null)
                  }}
                />
              </>
            )
          }}
        </Query>
      </PageBlock>
    </Layout>
  )
}

export default AdminGiftCardManager

