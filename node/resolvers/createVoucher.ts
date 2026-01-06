import { randomUUID } from 'crypto'

import { GiftCardHistoryService } from '../services/giftCardHistory'
import { calculateStatus } from '../utils/calculateVoucherStats'
import type { Context } from './types'
import {
  getAuthorEmail,
  findProfileIdByCpf,
  getClientInfo,
  extractErrorMessage,
} from './utils'
import { formatExpirationDate } from './utils/date'

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
    let clientInfo: { email?: string; name?: string } = {}

    if (input.ownerCpf) {
      profileId = await findProfileIdByCpf(context, input.ownerCpf)
      if (profileId) {
        clientInfo = await getClientInfo(context, input.ownerCpf)
      }
    }

    if (input.ownerCpf && !profileId) {
      throw new Error(
        `Profile not found for CPF: ${input.ownerCpf}. Please ensure the client exists in MasterData CL entity.`
      )
    }

    if (!profileId) {
      throw new Error(
        'ownerCpf is required. The VTEX GiftCard API requires a profileId for all gift cards created via API.'
      )
    }

    const formattedExpirationDate = formatExpirationDate(input.expirationDate)

    const cardPayload = {
      relationName: input.relationName,
      expiringDate: formattedExpirationDate,
      caption: input.caption || 'Gift Card',
      profileId,
      restrictedToOwner: true,
      currencyCode: input.currencyCode ?? 'BRL',
      multipleCredits: input.isReloadable ?? true,
      multipleRedemptions: input.multipleRedemptions ?? true,
    }

    nativeCard = await context.clients.giftCardNative!.createCard(cardPayload)

    const requestId = randomUUID()
    const transactionResult = await context.clients.giftCardNative!.createTransaction(
      nativeCard.id,
      {
        operation: 'Credit',
        value: input.initialValue,
        description: `Initial credit - ${input.initialValue}`,
        redemptionToken: nativeCard.redemptionToken,
        redemptionCode: nativeCard.redemptionCode,
        requestId,
      }
    )

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

    const masterDataDocument: any = {
      nativeId: nativeCard.id,
      authorEmail,
      createdAt: new Date().toISOString(),
      ownerCpf: input.ownerCpf || null,
      ownerEmail: clientInfo.email || null,
      ownerName: clientInfo.name || null,
      initialValue: input.initialValue,
      expirationDate: input.expirationDate,
      isReloadable: input.isReloadable || false,
      lastSyncedAt: new Date().toISOString(),
      transactions: [initialTransaction],
    }

    Object.keys(masterDataDocument).forEach(key => {
      if (masterDataDocument[key] === null || masterDataDocument[key] === '') {
        delete masterDataDocument[key]
      }
    })

    await context.clients.masterdata.createDocument({
      dataEntity: 'GiftcardManager',
      schema: 'giftcard-manager-v1',
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
  } catch (error) {
    if (nativeCard?.id) {
      console.error(
        '[createVoucher] CRITICAL: Native GiftCard created but operation failed:',
        { nativeCardId: nativeCard.id, error }
      )
    }

    throw new Error(
      extractErrorMessage(error) ||
        'Failed to create voucher. Check logs for details.'
    )
  }
}
