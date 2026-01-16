import React, { useState } from 'react'
import { Table, Button, Alert } from 'vtex.styleguide'
import type { InjectedIntlProps } from 'react-intl'
import { injectIntl } from 'react-intl'

interface Voucher {
  id: string
  code: string
  authorEmail: string
  nativeId: string
  ownerCpf: string
  ownerName?: string
  status: string
  expirationDate: string
  currentBalance: number
  initialValue: number
  totalCredited?: number
  totalDebited?: number
  isReloadable?: boolean
  transactionCount?: number
  createdAt?: string
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
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportError, setExportError] = useState('')

  const handleExportReport = async () => {
    setIsExporting(true)
    setExportError('')
    setExportSuccess(false)

    try {
      // CSV Headers - Todas as informações disponíveis
      const headers = [
        'ID',
        'Native ID',
        'Code',
        'Status',
        'Author Email',
        'CPF',
        'Client Name',
        'Initial Value (BRL)',
        'Current Balance (BRL)',
        'Total Credited (BRL)',
        'Total Debited (BRL)',
        'Expiration Date',
        'Is Reloadable',
        'Transaction Count',
        'Created At',
      ]

      // Build CSV content in chunks to handle large datasets
      const csvRows: string[] = [headers.join(';')]

      for (const voucher of vouchers) {
        const row = [
          voucher.id ?? '',
          voucher.nativeId ?? '',
          voucher.code ?? '',
          voucher.status ?? '',
          voucher.authorEmail ?? '',
          voucher.ownerCpf ?? '',
          voucher.ownerName ?? '',
          (voucher.initialValue ?? 0).toFixed(2).replace('.', ','),
          (voucher.currentBalance ?? 0).toFixed(2).replace('.', ','),
          (voucher.totalCredited ?? 0).toFixed(2).replace('.', ','),
          (voucher.totalDebited ?? 0).toFixed(2).replace('.', ','),
          voucher.expirationDate
            ? new Date(voucher.expirationDate).toLocaleDateString('pt-BR')
            : '',
          voucher.isReloadable ? 'Sim' : 'Não',
          (voucher.transactionCount ?? 0).toString(),
          voucher.createdAt
            ? new Date(voucher.createdAt).toLocaleDateString('pt-BR')
            : '',
        ]

        csvRows.push(
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')
        )
      }

      // Create blob and download
      const csvContent = csvRows.join('\n')
      const BOM = '\uFEFF'

      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv;charset=utf-8;',
      })

      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      const [timestamp] = new Date().toISOString().split('T')

      link.setAttribute('href', url)
      link.setAttribute('download', `giftcards-report-${timestamp}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch {
      setExportError(
        intl.formatMessage({
          id: 'giftcard-manager.export.error',
          defaultMessage: 'Error exporting report',
        })
      )
      setTimeout(() => setExportError(''), 5000)
    } finally {
      setIsExporting(false)
    }
  }

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
    <div>
      {exportSuccess && (
        <div className="mb5">
          <Alert type="success" onClose={() => setExportSuccess(false)}>
            {intl.formatMessage({
              id: 'giftcard-manager.export.success',
              defaultMessage: 'Report exported successfully!',
            })}
          </Alert>
        </div>
      )}
      {exportError && (
        <div className="mb5">
          <Alert type="error" onClose={() => setExportError('')}>
            {exportError}
          </Alert>
        </div>
      )}
      <div className="flex justify-end mb5">
        <div className="mr3">
          <Button
            variation="secondary"
            onClick={handleExportReport}
            isLoading={isExporting}
            disabled={loading || vouchers.length === 0}
          >
            {intl.formatMessage({
              id: 'giftcard-manager.exportReport',
              defaultMessage: 'Export Report',
            })}
          </Button>
        </div>
        <Button variation="primary" onClick={onCreateClick}>
          {intl.formatMessage({
            id: 'giftcard-manager.createNew',
            defaultMessage: 'Create New',
          })}
        </Button>
      </div>
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
        }}
      />
    </div>
  )
}

export default injectIntl(VouchersTable)
