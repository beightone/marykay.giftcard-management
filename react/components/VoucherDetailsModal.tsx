import React from 'react'
import { Modal, Card, Table, Spinner } from 'vtex.styleguide'
import { Query } from 'react-apollo'
import GET_VOUCHER from '../graphql/queries/get-voucher.gql'

interface VoucherDetailsModalProps {
  isOpen: boolean
  voucherId: string | null
  onClose: () => void
}

// interface Transaction {
//   id: string
//   operation: string
//   value: number
//   balanceAfter: number
//   description: string
//   orderId?: string
//   orderNumber?: string
//   createdAt: string
//   createdBy?: string
//   source: string
// }

const VoucherDetailsModal: React.FC<VoucherDetailsModalProps> = ({
  isOpen,
  voucherId,
  onClose,
}) => {
  const transactionSchema = {
    properties: {
      operation: {
        title: 'Operation',
        cellRenderer: ({ cellData }: { cellData: string }) => {
          const color = cellData === 'Credit' ? '#79B03A' : '#FF4C4C'
          return <span style={{ color, fontWeight: 'bold' }}>{cellData}</span>
        },
      },
      value: {
        title: 'Value',
        cellRenderer: ({ cellData }: { cellData: number }) => {
          return (
            <span style={{ fontWeight: 'bold' }}>
              R$ {cellData?.toFixed(2) || '0.00'}
            </span>
          )
        },
      },
      balanceAfter: {
        title: 'Balance After',
        cellRenderer: ({ cellData }: { cellData: number }) => {
          return `R$ ${cellData?.toFixed(2) || '0.00'}`
        },
      },
      description: {
        title: 'Description',
      },
      orderId: {
        title: 'Order ID',
        cellRenderer: ({ cellData }: { cellData?: string }) => {
          return cellData || '-'
        },
      },
      createdAt: {
        title: 'Date',
        cellRenderer: ({ cellData }: { cellData: string }) => {
          return cellData ? new Date(cellData).toLocaleString() : 'N/A'
        },
      },
    },
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Voucher Details & History"
      bottomBar={
        <div className="nowrap">
          <span className="mr4">
            <button className="btn btn--secondary" onClick={onClose}>
              Close
            </button>
          </span>
        </div>
      }
    >
      <Query query={GET_VOUCHER} variables={{ id: voucherId }} skip={!voucherId}>
        {({ data, loading, error }: any) => {
          if (loading) {
            return <Spinner />
          }

          if (error || !data?.voucher) {
            return (
              <div>Error loading voucher: {error?.message || 'Not found'}</div>
            )
          }

          const voucher = data.voucher
          const statusColor =
            voucher.status === 'active'
              ? '#79B03A'
              : voucher.status === 'expired'
              ? '#FF4C4C'
              : voucher.status === 'used'
              ? '#F71963'
              : '#CCCCCC'

          return (
            <div>
              <div className="mb5">
                <Card>
                  <div className="flex flex-wrap">
                    <div className="w-50 pa4">
                      <h3 className="t-heading-5 mb4">Basic Information</h3>
                      <div className="mb3">
                        <strong>Code:</strong> {voucher.code}
                      </div>
                      <div className="mb3">
                        <strong>Current Balance:</strong>{' '}
                        <span
                          style={{ fontSize: '1.5rem', color: '#79B03A', fontWeight: 'bold' }}
                        >
                          R$ {voucher.currentBalance?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="mb3">
                        <strong>Initial Value:</strong> R${' '}
                        {voucher.initialValue?.toFixed(2) || '0.00'}
                      </div>
                      <div className="mb3">
                        <strong>Status:</strong>{' '}
                        <span
                          style={{
                            color: statusColor,
                            textTransform: 'capitalize',
                            fontWeight: 'bold',
                          }}
                        >
                          {voucher.status}
                        </span>
                      </div>
                      <div className="mb3">
                        <strong>Reloadable:</strong>{' '}
                        {voucher.isReloadable ? 'Yes' : 'No'}
                      </div>
                      {voucher.caption && (
                        <div className="mb3">
                          <strong>Caption:</strong> {voucher.caption}
                        </div>
                      )}
                    </div>
                    <div className="w-50 pa4">
                      <h3 className="t-heading-5 mb4">Owner Information</h3>
                      {voucher.ownerName ? (
                        <>
                          <div className="mb3">
                            <strong>Owner:</strong> {voucher.ownerName}
                          </div>
                          {voucher.ownerEmail && (
                            <div className="mb3">
                              <strong>Email:</strong> {voucher.ownerEmail}
                            </div>
                          )}
                          {voucher.ownerCpf && (
                            <div className="mb3">
                              <strong>CPF:</strong> {voucher.ownerCpf}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="mb3">No owner assigned</div>
                      )}
                      <h3 className="t-heading-5 mb4 mt5">Created By</h3>
                      <div className="mb3">
                        <strong>Author:</strong> {voucher.authorEmail}
                      </div>
                      {voucher.createdAt && (
                        <div className="mb3">
                          <strong>Created:</strong>{' '}
                          {new Date(voucher.createdAt).toLocaleString()}
                        </div>
                      )}
                      <div className="mb3">
                        <strong>Expiration:</strong>{' '}
                        {new Date(voucher.expirationDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mb5">
                <Card>
                  <h3 className="t-heading-5 mb4">Financial Summary</h3>
                  <div className="flex flex-wrap">
                    <div className="w-33 pa3">
                      <div className="t-small c-muted-1">Total Credited</div>
                      <div className="t-heading-3" style={{ color: '#79B03A' }}>
                        R$ {voucher.totalCredited?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="w-33 pa3">
                      <div className="t-small c-muted-1">Total Debited</div>
                      <div className="t-heading-3" style={{ color: '#FF4C4C' }}>
                        R$ {voucher.totalDebited?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="w-33 pa3">
                      <div className="t-small c-muted-1">Transactions</div>
                      <div className="t-heading-3">
                        {voucher.transactionCount || 0}
                      </div>
                    </div>
                  </div>
                  {voucher.lastTransactionDate && (
                    <div className="mt3 pt3 bt b--muted-4">
                      <div className="t-small c-muted-1">
                        Last Transaction:{' '}
                        {new Date(voucher.lastTransactionDate).toLocaleString()}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {voucher.orderIds && voucher.orderIds.length > 0 && (
                <div className="mb5">
                  <Card>
                    <h3 className="t-heading-5 mb4">Related Orders</h3>
                    <ul>
                      {voucher.orderIds.map((orderId: string) => (
                        <li key={orderId}>{orderId}</li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              <div>
                <Card title="Transaction History">
                  <Table
                    fullWidth
                    items={voucher.transactions || []}
                    schema={transactionSchema}
                  />
                </Card>
              </div>
            </div>
          )
        }}
      </Query>
    </Modal>
  )
}

export default VoucherDetailsModal
