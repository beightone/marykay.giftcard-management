import React from 'react'
import { Table } from 'vtex.styleguide'
import type { InjectedIntlProps } from 'react-intl'
import { injectIntl } from 'react-intl'

interface Voucher {
  id: string
  code: string
  authorEmail: string
  nativeId: string
  ownerCpf: string
  status: string
  expirationDate: string
  currentBalance: number
  initialValue: number
}

interface VouchersTableProps extends InjectedIntlProps {
  vouchers: Voucher[]
  loading: boolean
  onRowClick: (voucher: Voucher) => void
  onCreateClick: () => void
}

const VouchersTable: React.FC<VouchersTableProps> = ({
  vouchers,
  loading,
  onRowClick,
  onCreateClick,
  intl,
}) => {
  const schema = {
    properties: {
      code: {
        title: 'Code',
        cellRenderer: ({ cellData }: { cellData: string }) => {
          if (!cellData) return ''

          return cellData
        },
      },
      authorEmail: {
        title: 'Author',
      },
      ownerCpf: {
        title: 'Client (CPF)',
      },
      status: {
        title: 'Status',
        cellRenderer: ({ cellData }: { cellData: string }) => {
          const statusColor =
            cellData === 'active'
              ? '#79B03A'
              : cellData === 'expired'
              ? '#FF4C4C'
              : '#CCCCCC'

          return (
            <span style={{ color: statusColor, textTransform: 'capitalize' }}>
              {cellData}
            </span>
          )
        },
      },
      expirationDate: {
        title: 'Expiration',
        cellRenderer: ({ cellData }: { cellData: string }) => {
          return new Date(cellData).toLocaleDateString()
        },
      },
    },
  }

  return (
    <Table
      fullWidth
      items={vouchers}
      schema={schema}
      loading={loading}
      onRowClick={({ rowData }: { rowData: Voucher }) => onRowClick(rowData)}
      toolbar={{
        inputSearch: {
          placeholder: intl.formatMessage({
            id: 'giftcard-manager.searchPlaceholder',
            defaultMessage: 'Search by CPF...',
          }),
          value: '',
          onChange: () => {},
        },
        newLine: {
          label: intl.formatMessage({
            id: 'giftcard-manager.createNew',
            defaultMessage: 'Create New',
          }),
          handleCallback: onCreateClick,
        },
      }}
    />
  )
}

export default injectIntl(VouchersTable)
