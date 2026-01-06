import type { Context } from '../types'

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
) => {
  const docs = await context.clients.masterdata.searchDocuments({
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
) => {
  const docs = await context.clients.masterdata.searchDocuments({
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
  fields: Record<string, any>
) => {
  const hasTransactionsArray =
    fields.transactions && Array.isArray(fields.transactions)

  console.log('[updateVoucherDocument] Updating document:', {
    id,
    fields: Object.keys(fields),
    transactionsType: hasTransactionsArray
      ? 'array'
      : typeof fields.transactions,
    transactionsLength: hasTransactionsArray ? fields.transactions.length : 0,
  })

  try {
    // Se está atualizando o array de transactions, pode precisar usar updateDocument completo
    // ou serializar como JSON string dependendo do MasterData V2
    // Tentamos primeiro updatePartialDocument
    if (
      typeof context.clients.masterdata.updatePartialDocument === 'function'
    ) {
      try {
        const result = await context.clients.masterdata.updatePartialDocument({
          dataEntity: 'GiftcardManager',
          schema: 'giftcard-manager-v1',
          id,
          fields,
        })
        console.log('[updateVoucherDocument] updatePartialDocument success')
        return result
      } catch (partialError) {
        // Se updatePartialDocument falhar e estivermos atualizando transactions,
        // tenta serializar como JSON string
        if (hasTransactionsArray) {
          console.log(
            '[updateVoucherDocument] updatePartialDocument failed, trying with JSON string for transactions'
          )
          const fieldsWithString = {
            ...fields,
            transactions: JSON.stringify(fields.transactions),
          }
          const result = await context.clients.masterdata.updatePartialDocument(
            {
              dataEntity: 'GiftcardManager',
              schema: 'giftcard-manager-v1',
              id,
              fields: fieldsWithString,
            }
          )
          console.log(
            '[updateVoucherDocument] updatePartialDocument with JSON string success'
          )
          return result
        }
        throw partialError
      }
    }

    // Fallback to updateDocument if updatePartialDocument doesn't exist
    const result = await context.clients.masterdata.updateDocument({
      dataEntity: 'GiftcardManager',
      schema: 'giftcard-manager-v1',
      id,
      fields,
    })
    console.log('[updateVoucherDocument] updateDocument success')
    return result
  } catch (error) {
    const errorResponse = (error as any)?.response?.data
    const errorDetails = {
      message: (error as any)?.message,
      status: (error as any)?.response?.status,
      statusText: (error as any)?.response?.statusText,
      responseData: errorResponse,
    }

    // Log detalhado do erro
    console.error(
      '[updateVoucherDocument] Error details:',
      JSON.stringify(errorDetails, null, 2)
    )

    // Log específico dos erros de validação
    if (errorResponse?.errors) {
      console.error('[updateVoucherDocument] Validation errors:')
      errorResponse.errors.forEach((err: any, index: number) => {
        console.error(`  [${index}]`, JSON.stringify(err, null, 2))
      })
    }

    throw error
  }
}

export const findProfileIdByCpf = async (
  context: Context,
  cpf: string
): Promise<string | null> => {
  try {
    const response = await context.clients.masterdata.searchDocuments({
      dataEntity: 'CL',
      fields: ['userId'],
      where: `document=${cpf}`,
      pagination: {
        page: 1,
        pageSize: 1,
      },
    })

    return response && response.length > 0 ? response[0].userId : null
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
    const response = await context.clients.masterdata.searchDocuments({
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
        email: client.email || '',
        name: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
      }
    }
  } catch {
    // Ignore errors
  }

  return {}
}
