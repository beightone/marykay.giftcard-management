import React, { useState } from 'react'
import {
  Modal,
  Input,
  Button,
  DatePicker,
  Toggle,
  Alert,
} from 'vtex.styleguide'
import { Mutation } from 'react-apollo'
import { FormattedMessage, injectIntl } from 'react-intl'
import type { InjectedIntlProps } from 'react-intl'

import CREATE_VOUCHER from '../graphql/mutations/create-voucher.gql'
import ClientSearch from './ClientSearch'

interface CreateVoucherModalProps extends InjectedIntlProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Client {
  id: string
  document: string
  firstName: string
  lastName: string
  email: string
}

const CreateVoucherModal: React.FC<CreateVoucherModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  intl,
}) => {
  const [initialValue, setInitialValue] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [ownerCpf, setOwnerCpf] = useState('')
  const [caption, setCaption] = useState('')
  const [relationName, setRelationName] = useState('')
  const [isReloadable, setIsReloadable] = useState(false)
  const [multipleRedemptions, setMultipleRedemptions] = useState(true)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleClose = () => {
    setInitialValue('')
    setExpirationDate('')
    setOwnerCpf('')
    setCaption('')
    setRelationName('')
    setIsReloadable(false)
    setMultipleRedemptions(true)
    setSelectedClient(null)
    setError('')
    setSuccess(false)
    onClose()
  }

  const handleSubmit = async (createVoucher: any) => {
    if (!initialValue || !expirationDate || !relationName) {
      setError(
        intl.formatMessage({
          id: 'giftcard-manager.create.error.required',
          defaultMessage:
            'Initial value, expiration date, and relation name are required',
        })
      )

      return
    }

    setError('')
    setSuccess(false)

    try {
      await createVoucher({
        variables: {
          input: {
            initialValue: parseFloat(initialValue),
            expirationDate,
            ownerCpf: ownerCpf || undefined,
            caption: caption || undefined,
            relationName,
            isReloadable,
            multipleRedemptions,
            currencyCode: 'BRL',
          },
        },
      })

      setSuccess(true)
      setTimeout(() => {
        handleClose()
        onSuccess()
      }, 1000)
    } catch (err) {
      setError((err as any)?.message || 'Failed to create voucher')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={intl.formatMessage({
        id: 'giftcard-manager.create.title',
        defaultMessage: 'Create Gift Card',
      })}
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
          <Alert type="success">
            {intl.formatMessage({
              id: 'giftcard-manager.create.success',
              defaultMessage: 'Gift Card created successfully!',
            })}
          </Alert>
        </div>
      )}
      <Mutation mutation={CREATE_VOUCHER}>
        {(createVoucher: any, { loading: creating }: any) => (
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSubmit(createVoucher)
            }}
          >
            <div className="mb5">
              <Input
                label={intl.formatMessage({
                  id: 'giftcard-manager.create.initialValue',
                  defaultMessage: 'Initial Value',
                })}
                type="number"
                step="0.01"
                value={initialValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInitialValue(e.target.value)
                }
                required
              />
            </div>
            <div className="mb5">
              <DatePicker
                label={intl.formatMessage({
                  id: 'giftcard-manager.create.expirationDate',
                  defaultMessage: 'Expiration Date',
                })}
                value={expirationDate}
                onChange={(date: string) => setExpirationDate(date)}
                locale="pt-BR"
                required
              />
            </div>
            <div className="mb5">
              <ClientSearch
                cpf={ownerCpf}
                selectedClient={selectedClient}
                onCpfChange={cpf => {
                  setOwnerCpf(cpf)
                  setSelectedClient(null)
                }}
                onClientSelect={client => {
                  setSelectedClient(client)
                  setOwnerCpf(client.document)
                }}
                onClear={() => {
                  setSelectedClient(null)
                  setOwnerCpf('')
                }}
              />
            </div>
            <div className="mb5">
              <Input
                label={intl.formatMessage({
                  id: 'giftcard-manager.create.relationName',
                  defaultMessage: 'Relation Name *',
                })}
                value={relationName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRelationName(e.target.value)
                }
                placeholder={intl.formatMessage({
                  id: 'giftcard-manager.create.relationNamePlaceholder',
                  defaultMessage: 'e.g., loyalty-program, promotion, refund',
                })}
                required
              />
              <small className="c-muted-1">
                {intl.formatMessage({
                  id: 'giftcard-manager.create.relationNameHint',
                  defaultMessage:
                    'Represents the relationship between the client and the store',
                })}
              </small>
            </div>
            <div className="mb5">
              <Input
                label={intl.formatMessage({
                  id: 'giftcard-manager.create.caption',
                  defaultMessage: 'Caption',
                })}
                value={caption}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCaption(e.target.value)
                }
                placeholder={intl.formatMessage({
                  id: 'giftcard-manager.create.captionPlaceholder',
                  defaultMessage: 'Optional caption',
                })}
              />
            </div>
            <div className="mb5">
              <Toggle
                label={intl.formatMessage({
                  id: 'giftcard-manager.create.isReloadable',
                  defaultMessage: 'Is Reloadable',
                })}
                checked={isReloadable}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setIsReloadable(e.target.checked)
                }
              />
              <small className="c-muted-1">
                {intl.formatMessage({
                  id: 'giftcard-manager.create.isReloadableHint',
                  defaultMessage:
                    'Allows multiple credits to be added to this gift card',
                })}
              </small>
            </div>
            <div className="mb5">
              <Toggle
                label={intl.formatMessage({
                  id: 'giftcard-manager.create.multipleRedemptions',
                  defaultMessage: 'Multiple Redemptions',
                })}
                checked={multipleRedemptions}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMultipleRedemptions(e.target.checked)
                }
              />
              <small className="c-muted-1">
                {intl.formatMessage({
                  id: 'giftcard-manager.create.multipleRedemptionsHint',
                  defaultMessage:
                    'Allows the gift card to be used multiple times until balance is zero',
                })}
              </small>
            </div>
            <div className="flex justify-end mt5">
              <Button
                variation="tertiary"
                onClick={handleClose}
                disabled={creating}
              >
                <FormattedMessage
                  id="giftcard-manager.create.cancel"
                  defaultMessage="Cancel"
                />
              </Button>
              <Button
                type="submit"
                variation="primary"
                isLoading={creating}
                disabled={creating}
              >
                <FormattedMessage
                  id="giftcard-manager.create.createVoucher"
                  defaultMessage="Create Voucher"
                />
              </Button>
            </div>
          </form>
        )}
      </Mutation>
    </Modal>
  )
}

export default injectIntl(CreateVoucherModal)
