import { GiftCardHistoryService } from '../services/giftCardHistory'
import { calculateStatus } from '../utils/calculateVoucherStats'

interface CreateVoucherInput {
  initialValue: number
  expirationDate: string
  ownerCpf?: string
  caption?: string
  relationName: string
  isReloadable?: boolean
  multipleRedemptions?: boolean
  currencyCode?: string
}

interface Context {
  clients: {
    giftCardNative: any
    masterdata: any
  }
  vtex: {
    account: string
    workspace: string
    adminUserAuthToken?: string
    authToken?: string
  }
}

const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

const getAuthorEmail = (context: Context): string => {
  const token = context.vtex.adminUserAuthToken || context.vtex.authToken || ''
  const decoded = decodeJWT(token)
  return decoded?.sub || decoded?.email || 'unknown@vtex.com'
}

const findProfileIdByCpf = async (
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

    if (response && response.length > 0) {
      return response[0].userId
    }
    return null
  } catch (error) {
    return null
  }
}

const getClientInfo = async (
  context: Context,
  cpf: string
): Promise<{
  email?: string
  name?: string
}> => {
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
  } catch (error) {
    console.error('Error fetching client info:', error)
  }

  return {}
}

const formatExpirationDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format')
    }
    // Formato ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ
    return date.toISOString()
  } catch (error) {
    throw new Error(`Invalid expiration date format: ${dateString}. Expected ISO 8601 format.`)
  }
}

export const createVoucher = async (
  _root: any,
  args: { input: CreateVoucherInput },
  context: Context
) => {
  const { input } = args
  const authorEmail = getAuthorEmail(context)
  let nativeCard: any = null

  try {
    let profileId: string | null = null
    let clientInfo: {
      email?: string
      name?: string
    } = {}

    // A API VTEX requer profileId obrigatório
    if (input.ownerCpf) {
      profileId = await findProfileIdByCpf(context, input.ownerCpf)
      if (profileId) {
        clientInfo = await getClientInfo(context, input.ownerCpf)
      }
    }

    // Se não encontrou profileId e ownerCpf foi fornecido, lança erro
    if (input.ownerCpf && !profileId) {
      throw new Error(
        `Profile not found for CPF: ${input.ownerCpf}. Please ensure the client exists in MasterData CL entity.`
      )
    }

    // Se não tem ownerCpf, precisa criar um profileId genérico ou exigir
    if (!profileId) {
      throw new Error(
        'ownerCpf is required. The VTEX GiftCard API requires a profileId for all gift cards created via API.'
      )
    }

    // Formata a data de expiração para ISO 8601
    const formattedExpirationDate = formatExpirationDate(input.expirationDate)

    const cardPayload = {
      relationName: input.relationName,
      expiringDate: formattedExpirationDate,
      caption: input.caption || 'Gift Card',
      profileId, // Obrigatório pela API VTEX
      restrictedToOwner: true, // Sempre true quando tem profileId
      currencyCode: 'BRL', // Usa o fornecido ou padrão BRL
      multipleCredits: input.isReloadable ?? true, // Permite múltiplos créditos se reloadable
      multipleRedemptions: input.multipleRedemptions ?? true, // Configurável pelo admin
    }

    nativeCard = await context.clients.giftCardNative.createCard(cardPayload)

    const transactionResult = await context.clients.giftCardNative.createTransaction(
      nativeCard.id,
      {
        operation: 'Credit',
        value: input.initialValue,
        description: `Initial credit - ${input.initialValue}`,
      }
    )

    console.log('transactionResult', transactionResult)

    const initialTransaction = GiftCardHistoryService.transformNativeTransaction(
      {
        id: transactionResult.id,
        operation: 'Credit',
        value: input.initialValue,
        description: `Initial credit - ${input.initialValue}`,
        date: new Date().toISOString(),
      },
      input.initialValue,
      authorEmail
    )

    const masterDataDocument = {
      nativeId: nativeCard.id,
      authorEmail,
      createdAt: new Date().toISOString(),
      ownerCpf: input.ownerCpf || '',
      ownerEmail: clientInfo.email || '',
      ownerName: clientInfo.name || '',
      initialValue: input.initialValue,
      expirationDate: input.expirationDate,
      isReloadable: input.isReloadable || false,
      lastSyncedAt: new Date().toISOString(),
      transactions: JSON.stringify([initialTransaction]),
    }

    await context.clients.masterdata.createDocument({
      dataEntity: 'GiftCardManager',
      fields: masterDataDocument,
    })

    const currentBalance = nativeCard.balance || input.initialValue
    const status = calculateStatus(
      currentBalance,
      input.expirationDate,
      0,
      input.initialValue
    )

    return {
      id: nativeCard.id,
      nativeId: nativeCard.id,
      code: nativeCard.redemptionCode,
      currentBalance,
      authorEmail,
      ownerCpf: input.ownerCpf || '',
      initialValue: input.initialValue,
      expirationDate: nativeCard.expiringDate || input.expirationDate,
      isReloadable: input.isReloadable || false,
      status,
    }
  } catch (error: any) {
    if (nativeCard?.id) {
      console.error(
        `CRITICAL: Native GiftCard created (${nativeCard.id}) but MasterData sync failed:`,
        error
      )
    }

    // Melhora o tratamento de erro para mostrar detalhes da API
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      'Failed to create voucher'

    const errorDetails = error?.response?.data
      ? JSON.stringify(error?.response?.data, null, 2)
      : ''

    console.error('GiftCard API Error:', {
      message: errorMessage,
      status: error?.response?.status,
      data: errorDetails,
    })

    throw new Error(errorMessage)
  }
}
