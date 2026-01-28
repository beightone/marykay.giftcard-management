import React, { useState, useRef } from 'react'
import {
  Modal,
  Card,
  Table,
  Spinner,
  Button,
  Input,
  Alert,
} from 'vtex.styleguide'
import { Query, Mutation } from 'react-apollo'
import { FormattedMessage, injectIntl } from 'react-intl'
import type { InjectedIntlProps } from 'react-intl'

import GET_VOUCHER from '../graphql/queries/get-voucher.gql'
import ADJUST_BALANCE from '../graphql/mutations/adjust-balance.gql'
import DELETE_VOUCHER from '../graphql/mutations/delete-voucher.gql'

interface VoucherDetailsModalProps extends InjectedIntlProps {
  isOpen: boolean
  voucherId: string | null
  onClose: () => void
  onSuccess?: () => void
}

const VoucherDetailsModal: React.FC<VoucherDetailsModalProps> = ({
  isOpen,
  voucherId,
  onClose,
  onSuccess,
  intl,
}) => {
  const [showAddBalance, setShowAddBalance] = useState(false)
  const [showRemoveBalance, setShowRemoveBalance] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [balanceDescription, setBalanceDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const refetchRef = useRef<(() => void) | null>(null)

  const handleClose = () => {
    setShowAddBalance(false)
    setShowRemoveBalance(false)
    setShowDeleteConfirm(false)
    setBalanceAmount('')
    setBalanceDescription('')
    setError('')
    setSuccess('')
    onClose()
  }

  const handleBalanceSubmit = async (
    adjustBalance: any,
    operation: 'add' | 'remove'
  ) => {
    if (!balanceAmount || !balanceDescription || !voucherId) {
      setError('Amount and description are required')

      return
    }

    const normalizedAmount = balanceAmount.replace(',', '.')
    const parsedValue = parseFloat(normalizedAmount)

    if (isNaN(parsedValue) || parsedValue <= 0) {
      setError('Please enter a valid amount')

      return
    }

    const value = operation === 'add' ? parsedValue : -parsedValue

    setError('')
    setSuccess('')

    try {
      await adjustBalance({
        variables: {
          input: {
            nativeId: voucherId,
            value,
            description: balanceDescription,
          },
        },
      })

      setSuccess(
        operation === 'add'
          ? 'Balance added successfully'
          : 'Balance removed successfully'
      )

      setTimeout(() => {
        setShowAddBalance(false)
        setShowRemoveBalance(false)
        setBalanceAmount('')
        setBalanceDescription('')
        setSuccess('')
        // Refetch will be triggered by onSuccess
      }, 1500)
    } catch (err) {
      setError((err as any)?.message || 'Failed to adjust balance')
    } finally {
      // Refetch voucher data after balance adjustment
      if (refetchRef.current) {
        setTimeout(() => {
          refetchRef.current?.()
        }, 500)
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 500)
      }
    }
  }

  const handleDelete = async (deleteVoucher: any) => {
    if (!voucherId) return

    try {
      await deleteVoucher({
        variables: { nativeId: voucherId },
      })

      handleClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError((err as any)?.message || 'Failed to delete voucher')
    } finally {
      if (onSuccess) {
        onSuccess()
      }
    }
  }

  const transactionSchema = {
    properties: {
      operation: {
        title: intl.formatMessage({
          id: 'giftcard-manager.details.operation',
          defaultMessage: 'Operation',
        }),
        cellRenderer: ({ cellData }: { cellData: string }) => {
          const color = cellData === 'Credit' ? '#79B03A' : '#FF4C4C'

          return <span style={{ color, fontWeight: 'bold' }}>{cellData}</span>
        },
      },
      value: {
        title: intl.formatMessage({
          id: 'giftcard-manager.details.value',
          defaultMessage: 'Value',
        }),
        cellRenderer: ({ cellData }: { cellData: number }) => {
          return (
            <span style={{ fontWeight: 'bold' }}>
              R$ {cellData?.toFixed(2) || '0.00'}
            </span>
          )
        },
      },
      balanceAfter: {
        title: intl.formatMessage({
          id: 'giftcard-manager.details.balanceAfter',
          defaultMessage: 'Balance After',
        }),
        cellRenderer: ({ cellData }: { cellData: number }) => {
          return `R$ ${cellData?.toFixed(2) || '0.00'}`
        },
      },
      description: {
        title: intl.formatMessage({
          id: 'giftcard-manager.details.description',
          defaultMessage: 'Description',
        }),
      },
      orderId: {
        title: intl.formatMessage({
          id: 'giftcard-manager.details.orderId',
          defaultMessage: 'Order ID',
        }),
        cellRenderer: ({ cellData }: { cellData?: string }) => {
          return cellData || '-'
        },
      },
      createdAt: {
        title: intl.formatMessage({
          id: 'giftcard-manager.details.date',
          defaultMessage: 'Date',
        }),
        cellRenderer: ({ cellData }: { cellData: string }) => {
          return cellData ? new Date(cellData).toLocaleString('pt-BR') : 'N/A'
        },
      },
    },
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={intl.formatMessage({
        id: 'giftcard-manager.details.title',
        defaultMessage: 'Voucher Details & History',
      })}
      bottomBar={
        <div className="flex justify-end">
          <Button
            variation="tertiary"
            onClick={handleClose}
            disabled={showAddBalance || showRemoveBalance || showDeleteConfirm}
          >
            <FormattedMessage
              id="giftcard-manager.details.close"
              defaultMessage="Close"
            />
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb5">
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </div>
      )}
      {success && (
        <div className="mb5">
          <Alert type="success">{success}</Alert>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="mb5">
          <Card>
            <div className="mb5">
              <Alert type="warning">
                {intl.formatMessage({
                  id: 'giftcard-manager.details.deleteConfirm',
                  defaultMessage:
                    'Are you sure you want to delete this gift card? This action cannot be undone.',
                })}
              </Alert>
            </div>
            <div className="flex justify-end">
              <Button
                variation="tertiary"
                onClick={() => setShowDeleteConfirm(false)}
                className="mr3"
              >
                <FormattedMessage
                  id="giftcard-manager.details.cancel"
                  defaultMessage="Cancel"
                />
              </Button>
              <Mutation mutation={DELETE_VOUCHER}>
                {(deleteVoucher: any, { loading: deleting }: any) => (
                  <Button
                    variation="danger"
                    isLoading={deleting}
                    onClick={() => handleDelete(deleteVoucher)}
                  >
                    <FormattedMessage
                      id="giftcard-manager.details.delete"
                      defaultMessage="Delete Gift Card"
                    />
                  </Button>
                )}
              </Mutation>
            </div>
          </Card>
        </div>
      )}

      {(showAddBalance || showRemoveBalance) && (
        <div className="mb5">
          <Card>
            <h3 className="t-heading-5 mb4">
              {showAddBalance
                ? intl.formatMessage({
                  id: 'giftcard-manager.details.addBalance',
                  defaultMessage: 'Add Balance',
                })
                : intl.formatMessage({
                  id: 'giftcard-manager.details.removeBalance',
                  defaultMessage: 'Remove Balance',
                })}
            </h3>
            <div className="mb5">
              <Input
                label={intl.formatMessage({
                  id: 'giftcard-manager.details.balanceAmount',
                  defaultMessage: 'Amount',
                })}
                type="text"
                value={balanceAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value
                    .replace(/[^\d,]/g, '')
                    .replace(/,/g, (match, offset, string) => {
                      const beforeComma = string.substring(0, offset)

                      return beforeComma.includes(',') ? '' : match
                    })

                  setBalanceAmount(value)
                }}
                required
              />
            </div>
            <div className="mb5">
              <Input
                label={intl.formatMessage({
                  id: 'giftcard-manager.details.balanceDescription',
                  defaultMessage: 'Description',
                })}
                value={balanceDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBalanceDescription(e.target.value)
                }
                required
              />
            </div>
            <div className="flex justify-end">
              <Button
                variation="tertiary"
                onClick={() => {
                  setShowAddBalance(false)
                  setShowRemoveBalance(false)
                  setBalanceAmount('')
                  setBalanceDescription('')
                  setError('')
                }}
                className="mr3"
              >
                <FormattedMessage
                  id="giftcard-manager.details.cancel"
                  defaultMessage="Cancel"
                />
              </Button>
              <Mutation mutation={ADJUST_BALANCE}>
                {(adjustBalance: any, { loading: adjusting }: any) => (
                  <Button
                    variation="primary"
                    isLoading={adjusting}
                    onClick={() =>
                      handleBalanceSubmit(
                        adjustBalance,
                        showAddBalance ? 'add' : 'remove'
                      )
                    }
                  >
                    <FormattedMessage
                      id="giftcard-manager.details.confirm"
                      defaultMessage="Confirm"
                    />
                  </Button>
                )}
              </Mutation>
            </div>
          </Card>
        </div>
      )}

      <Query
        query={GET_VOUCHER}
        variables={{ id: voucherId }}
        skip={!voucherId}
        fetchPolicy="network-only"
      >
        {({ data, loading, error: queryError, refetch }: any) => {
          refetchRef.current = refetch
          if (loading) {
            return <Spinner />
          }

          if (queryError || !data?.voucher) {
            return (
              <Alert type="error">
                Error loading voucher: {queryError?.message || 'Not found'}
              </Alert>
            )
          }

          const { voucher } = data

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
              <div className="mb5 flex justify-end">
                <Button
                  variation="secondary"
                  onClick={() => {
                    setShowAddBalance(true)
                    setShowRemoveBalance(false)
                    setShowDeleteConfirm(false)
                  }}
                  className="mr3"
                  disabled={
                    showAddBalance || showRemoveBalance || showDeleteConfirm
                  }
                >
                  <FormattedMessage
                    id="giftcard-manager.details.addBalance"
                    defaultMessage="Add Balance"
                  />
                </Button>
                <Button
                  variation="secondary"
                  onClick={() => {
                    setShowRemoveBalance(true)
                    setShowAddBalance(false)
                    setShowDeleteConfirm(false)
                  }}
                  className="mr3"
                  disabled={
                    showAddBalance || showRemoveBalance || showDeleteConfirm
                  }
                >
                  <FormattedMessage
                    id="giftcard-manager.details.removeBalance"
                    defaultMessage="Remove Balance"
                  />
                </Button>
                <Button
                  variation="danger"
                  onClick={() => {
                    setShowDeleteConfirm(true)
                    setShowAddBalance(false)
                    setShowRemoveBalance(false)
                  }}
                  disabled={
                    showAddBalance || showRemoveBalance || showDeleteConfirm
                  }
                >
                  <FormattedMessage
                    id="giftcard-manager.details.delete"
                    defaultMessage="Delete Gift Card"
                  />
                </Button>
              </div>

              <div className="mb5">
                <Card>
                  <div className="flex flex-wrap">
                    <div className="w-50 pa4">
                      <h3 className="t-heading-5 mb4">
                        <FormattedMessage
                          id="giftcard-manager.details.basicInfo"
                          defaultMessage="Basic Information"
                        />
                      </h3>
                      <div className="mb3">
                        <div className="t-small c-muted-1 mb1">Code</div>
                        <div className="t-body">{voucher.code}</div>
                      </div>
                      <div className="mb3">
                        <div className="t-small c-muted-1 mb1">
                          <FormattedMessage
                            id="giftcard-manager.details.currentBalance"
                            defaultMessage="Current Balance"
                          />
                        </div>
                        <div
                          className="t-heading-3"
                          style={{ color: '#79B03A', fontWeight: 'bold' }}
                        >
                          R$ {voucher.currentBalance?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div className="mb3">
                        <div className="t-small c-muted-1 mb1">
                          <FormattedMessage
                            id="giftcard-manager.details.initialValue"
                            defaultMessage="Initial Value"
                          />
                        </div>
                        <div className="t-body">
                          R$ {voucher.initialValue?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div className="mb3">
                        <div className="t-small c-muted-1 mb1">
                          <FormattedMessage
                            id="giftcard-manager.details.status"
                            defaultMessage="Status"
                          />
                        </div>
                        <div
                          className="t-body"
                          style={{
                            color: statusColor,
                            textTransform: 'capitalize',
                            fontWeight: 'bold',
                          }}
                        >
                          {voucher.status}
                        </div>
                      </div>
                      {voucher.createdAt && (
                        <div className="mb3">
                          <div className="t-small c-muted-1 mb1">
                            <FormattedMessage
                              id="giftcard-manager.details.created"
                              defaultMessage="Created"
                            />
                          </div>
                          <div className="t-body">
                            {new Date(voucher.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      )}
                      <div className="mb3">
                        <div className="t-small c-muted-1 mb1">
                          <FormattedMessage
                            id="giftcard-manager.details.reloadable"
                            defaultMessage="Reloadable"
                          />
                        </div>
                        <div className="t-body">
                          {voucher.isReloadable ? 'Yes' : 'No'}
                        </div>
                      </div>
                      {voucher.caption && (
                        <div className="mb3">
                          <div className="t-small c-muted-1 mb1">
                            <FormattedMessage
                              id="giftcard-manager.details.caption"
                              defaultMessage="Caption"
                            />
                          </div>
                          <div className="t-body">{voucher.caption}</div>
                        </div>
                      )}
                    </div>
                    <div className="w-50 pa4">
                      <h3 className="t-heading-5 mb4">
                        <FormattedMessage
                          id="giftcard-manager.details.ownerInfo"
                          defaultMessage="Owner Information"
                        />
                      </h3>
                      {voucher.ownerName ? (
                        <>
                          <div className="mb3">
                            <div className="t-small c-muted-1 mb1">
                              <FormattedMessage
                                id="giftcard-manager.details.owner"
                                defaultMessage="Owner"
                              />
                            </div>
                            <div className="t-body">{voucher.ownerName}</div>
                          </div>
                          {voucher.ownerEmail && (
                            <div className="mb3">
                              <div className="t-small c-muted-1 mb1">
                                <FormattedMessage
                                  id="giftcard-manager.details.email"
                                  defaultMessage="Email"
                                />
                              </div>
                              <div className="t-body">{voucher.ownerEmail}</div>
                            </div>
                          )}
                          {voucher.ownerCpf && (
                            <div className="mb3">
                              <div className="t-small c-muted-1 mb1">CPF</div>
                              <div className="t-body">{voucher.ownerCpf}</div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="mb3 c-muted-1">
                          <FormattedMessage
                            id="giftcard-manager.details.noOwner"
                            defaultMessage="No owner assigned"
                          />
                        </div>
                      )}
                      <h3 className="t-heading-5 mb4 mt5">
                        <FormattedMessage
                          id="giftcard-manager.details.createdBy"
                          defaultMessage="Created By"
                        />
                      </h3>
                      <div className="mb3">
                        <div className="t-small c-muted-1 mb1">
                          <FormattedMessage
                            id="giftcard-manager.details.author"
                            defaultMessage="Author"
                          />
                        </div>
                        <div className="t-body">{voucher.authorEmail}</div>
                      </div>
                      {voucher.createdAt && (
                        <div className="mb3">
                          <div className="t-small c-muted-1 mb1">
                            <FormattedMessage
                              id="giftcard-manager.details.created"
                              defaultMessage="Created"
                            />
                          </div>
                          <div className="t-body">
                            {new Date(voucher.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      )}
                      <div className="mb3">
                        <div className="t-small c-muted-1 mb1">
                          <FormattedMessage
                            id="giftcard-manager.details.expiration"
                            defaultMessage="Expiration"
                          />
                        </div>
                        <div className="t-body">
                          {new Date(
                            voucher.expirationDate
                          ).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mb5">
                <Card>
                  <h3 className="t-heading-5 mb4">
                    <FormattedMessage
                      id="giftcard-manager.details.financialSummary"
                      defaultMessage="Financial Summary"
                    />
                  </h3>
                  <div className="flex flex-wrap">
                    <div className="w-33 pa3">
                      <div className="t-small c-muted-1 mb2">
                        <FormattedMessage
                          id="giftcard-manager.details.totalCredited"
                          defaultMessage="Total Credited"
                        />
                      </div>
                      <div className="t-heading-3" style={{ color: '#79B03A' }}>
                        R$ {voucher.totalCredited?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="w-33 pa3">
                      <div className="t-small c-muted-1 mb2">
                        <FormattedMessage
                          id="giftcard-manager.details.totalDebited"
                          defaultMessage="Total Debited"
                        />
                      </div>
                      <div className="t-heading-3" style={{ color: '#FF4C4C' }}>
                        R$ {voucher.totalDebited?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="w-33 pa3">
                      <div className="t-small c-muted-1 mb2">
                        <FormattedMessage
                          id="giftcard-manager.details.transactions"
                          defaultMessage="Transactions"
                        />
                      </div>
                      <div className="t-heading-3">
                        {voucher.transactionCount || 0}
                      </div>
                    </div>
                  </div>
                  {voucher.lastTransactionDate && (
                    <div className="mt3 pt3 bt b--muted-4">
                      <div className="t-small c-muted-1">
                        <FormattedMessage
                          id="giftcard-manager.details.lastTransaction"
                          defaultMessage="Last Transaction"
                        />
                        :{' '}
                        {new Date(voucher.lastTransactionDate).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              <div>
                <Card>
                  <h3 className="t-heading-5 mb4">
                    <FormattedMessage
                      id="giftcard-manager.details.transactionHistory"
                      defaultMessage="Transaction History"
                    />
                  </h3>
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

export default injectIntl(VoucherDetailsModal)
