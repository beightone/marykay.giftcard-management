import { GiftCardHistoryService } from '../services/giftCardHistory'
import type { Context } from './types'
import {
  getAuthorEmail,
  searchVoucherByNativeId,
  updateVoucherDocument,
  parseTransactions,
  buildVoucherResponse,
  extractErrorMessage,
} from './utils'

export const adjustVoucherBalance = async (
  _root: any,
  args: { input: { nativeId: string; value: number; description: string } },
  context: Context
) => {
  const { nativeId, value, description } = args.input
  const authorEmail = getAuthorEmail(context)

  try {
    const mdDoc = await searchVoucherByNativeId(context, nativeId, [
      'id',
      'nativeId',
      'initialValue',
      'expirationDate',
      'transactions',
    ])

    if (!mdDoc) {
      throw new Error('Voucher not found in MasterData')
    }

    const nativeCard = await context.clients.giftCardNative.getCard(nativeId)
    const operation = value > 0 ? 'Credit' : 'Debit'
    const absoluteValue = Math.abs(value)
    const requestId = `adjust-${Date.now()}`

    const transactionResult = await context.clients.giftCardNative.createTransaction(
      nativeId,
      {
        operation,
        value: absoluteValue,
        description,
        redemptionToken: nativeCard.redemptionToken,
        redemptionCode: nativeCard.redemptionCode,
        requestId,
      }
    )

    const updatedNativeCard = await context.clients.giftCardNative.getCard(
      nativeId
    )
    const currentBalance = updatedNativeCard.balance || 0
    const existingTransactions = parseTransactions(mdDoc.transactions)

    const newTransaction = GiftCardHistoryService.transformNativeTransaction(
      {
        id: transactionResult.id || `adjust-${Date.now()}`,
        operation,
        value: absoluteValue,
        description,
        date: new Date().toISOString(),
      },
      currentBalance,
      authorEmail
    )

    const mergedTransactions = GiftCardHistoryService.mergeTransactions(
      existingTransactions,
      [newTransaction]
    )

    console.log(
      '[adjustVoucherBalance] Updating MasterData with transactions:',
      {
        documentId: mdDoc.id,
        transactionsCount: mergedTransactions.length,
        transactionsType: Array.isArray(mergedTransactions)
          ? 'array'
          : typeof mergedTransactions,
      }
    )

    try {
      await updateVoucherDocument(context, mdDoc.id, {
        lastSyncedAt: new Date().toISOString(),
        transactions: mergedTransactions, // Array direto, não stringify
      })
      console.log('[adjustVoucherBalance] MasterData updated successfully')
    } catch (updateError) {
      console.error('[adjustVoucherBalance] Error updating MasterData:', {
        error: (updateError as any)?.message,
        response: (updateError as any)?.response?.data,
        status: (updateError as any)?.response?.status,
      })
      throw updateError
    }

    const voucherDoc = await searchVoucherByNativeId(context, nativeId)
    if (!voucherDoc) {
      throw new Error('Voucher not found after update')
    }

    const finalNativeCard = await context.clients.giftCardNative!.getCard(
      nativeId
    )
    const transactions = parseTransactions(voucherDoc.transactions)

    return buildVoucherResponse(voucherDoc, finalNativeCard, transactions)
  } catch (error) {
    throw new Error(
      extractErrorMessage(error) || 'Failed to adjust voucher balance'
    )
  }
}
