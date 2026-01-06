import React from 'react'
import { Table } from 'vtex.styleguide'

interface Voucher {
  id: string
  code: string
  authorEmail: string
  ownerCpf: string
  status: string
  expirationDate: string
  currentBalance: number
  initialValue: number
}

interface VouchersTableProps {
  vouchers: Voucher[]
  loading: boolean
  onRowClick: (voucher: Voucher) => void
}

const VouchersTable: React.FC<VouchersTableProps> = ({
  vouchers,
  loading,
  onRowClick,
}) => {
  const schema = {
    properties: {
      code: {
        title: 'Code',
        cellRenderer: ({ cellData }: { cellData: string }) => {
          if (!cellData) return ''
          const last4 = cellData.length > 4 ? cellData.slice(-4) : cellData
          return `****-****-****-${last4}`
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
          placeholder: 'Search by CPF...',
          value: '',
          onChange: () => {},
        },
      }}
    />
  )
}

export default VouchersTable

