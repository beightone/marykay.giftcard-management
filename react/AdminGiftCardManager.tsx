import React, { useState, useRef } from 'react'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'
import { Query } from 'react-apollo'
import { injectIntl, InjectedIntlProps } from 'react-intl'

import GET_VOUCHERS from './graphql/queries/get-vouchers.gql'
import {
  VouchersTable,
  CreateVoucherModal,
  VoucherDetailsModal,
} from './components'
import './styles.global.css'

const AdminGiftCardManager: React.FC<InjectedIntlProps> = ({ intl }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(
    null
  )

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const refetchRef = useRef<(() => void) | null>(null)

  const handleRowClick = (voucher: { nativeId: string }) => {
    setSelectedVoucherId(voucher.nativeId)
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
          title={intl.formatMessage({
            id: 'giftcard-manager.title',
            defaultMessage: 'Gift Cards Manager',
          })}
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
                  onCreateClick={() => setIsCreateModalOpen(true)}
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
                  onSuccess={handleCreateSuccess}
                />
              </>
            )
          }}
        </Query>
      </PageBlock>
    </Layout>
  )
}

export default injectIntl(AdminGiftCardManager)
