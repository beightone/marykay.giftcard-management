import type { Context, VoucherDocument, ClientProfile } from '../types'

export const searchVoucherByNativeId = async (
  context: Context,
  nativeId: string,
  fields: string[] = [
    'id',
    'nativeId',
    'authorEmail',
    'createdAt',
    'ownerCpf',
    'ownerEmail',
    'ownerName',
    'initialValue',
    'expirationDate',
    'isReloadable',
    'transactions',
  ]
): Promise<VoucherDocument | null> => {
  const docs = await context.clients.masterdata.searchDocuments<VoucherDocument>({
    dataEntity: 'GiftcardManager',
    schema: 'giftcard-manager-v1',
    fields,
    where: `nativeId="${nativeId}"`,
    pagination: {
      page: 1,
      pageSize: 1,
    },
  })

  return docs && docs.length > 0 ? docs[0] : null
}

export const searchVoucherById = async (
  context: Context,
  id: string,
  fields: string[] = [
    'id',
    'nativeId',
    'authorEmail',
    'createdAt',
    'ownerCpf',
    'ownerEmail',
    'ownerName',
    'initialValue',
    'expirationDate',
    'isReloadable',
    'transactions',
  ]
): Promise<VoucherDocument | null> => {
  const docs = await context.clients.masterdata.searchDocuments<VoucherDocument>({
    dataEntity: 'GiftcardManager',
    schema: 'giftcard-manager-v1',
    fields,
    where: `id="${id}"`,
    pagination: {
      page: 1,
      pageSize: 1,
    },
  })

  return docs && docs.length > 0 ? docs[0] : null
}

export const updateVoucherDocument = async (
  context: Context,
  id: string,
  fields: Record<string, unknown>
): Promise<unknown> => {
  const hasTransactionsArray =
    fields.transactions && Array.isArray(fields.transactions)

  try {
    // Se está atualizando o array de transactions, pode precisar usar updateDocument completo
    // ou serializar como JSON string dependendo do MasterData V2
    // Tentamos primeiro updatePartialDocument
    try {
      const result = await context.clients.masterdata.updatePartialDocument({
        dataEntity: 'GiftcardManager',
        schema: 'giftcard-manager-v1',
        id,
        fields,
      })

      return result
    } catch (partialError) {
      // Se updatePartialDocument falhar e estivermos atualizando transactions,
      // tenta serializar como JSON string
      if (hasTransactionsArray) {
        const fieldsWithString = {
          ...fields,
          transactions: JSON.stringify(fields.transactions),
        }
        const result = await context.clients.masterdata.updatePartialDocument({
          dataEntity: 'GiftcardManager',
          schema: 'giftcard-manager-v1',
          id,
          fields: fieldsWithString,
        })

        return result
      }

      throw partialError
    }
  } catch (error) {
    throw error
  }
}

export const findProfileIdByCpf = async (
  context: Context,
  cpf: string
): Promise<string | null> => {
  try {
    const response = await context.clients.masterdata.searchDocuments<ClientProfile>({
      dataEntity: 'CL',
      fields: ['userId'],
      where: `document=${cpf}`,
      pagination: {
        page: 1,
        pageSize: 1,
      },
    })

    return response && response.length > 0 ? response[0].userId ?? null : null
  } catch {
    return null
  }
}

export const getClientInfo = async (
  context: Context,
  cpf: string
): Promise<{ email?: string; name?: string }> => {
  if (!cpf) {
    return {}
  }

  try {
    const response = await context.clients.masterdata.searchDocuments<ClientProfile>({
      dataEntity: 'CL',
      fields: ['email', 'firstName', 'lastName'],
      where: `document=${cpf}`,
      pagination: {
        page: 1,
        pageSize: 1,
      },
    })

    if (response && response.length > 0) {
      const client = response[0]

      return {
        email: client.email ?? '',
        name: `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim(),
      }
    }
  } catch {
    // Ignore errors
  }

  return {}
}
