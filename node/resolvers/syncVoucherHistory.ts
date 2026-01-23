import { GiftCardHistoryService } from '../services/giftCardHistory'
import {
  searchVoucherByNativeId,
  updateVoucherDocument,
  parseTransactions,
  extractErrorMessage,
} from './utils'

export const syncVoucherHistory = async (
  _root: unknown,
  args: { nativeId: string },
  context: Context
) => {
  try {
    const mdDoc = await searchVoucherByNativeId(context, args.nativeId, [
      'id',
      'nativeId',
      'expirationDate',
      'initialValue',
      'transactions',
    ])

    if (!mdDoc) {
      throw new Error('Voucher not found in MasterData')
    }

    const nativeCard = await context.clients.giftCardNative!.getCard(
      args.nativeId
    )
    const nativeTransactions = await context.clients.giftCardNative!.getTransactions(
      args.nativeId
    )

    const existingTransactions = parseTransactions(mdDoc.transactions)
    let currentBalance: number = nativeCard.balance || 0
    const newTransactions: any[] = []

    nativeTransactions.forEach((nativeTx: any, index: number) => {
      const balanceAfter =
        index === 0
          ? currentBalance
          : currentBalance -
          (nativeTx.operation === 'Debit' ? nativeTx.value : -nativeTx.value)

      const transformedTx = GiftCardHistoryService.transformNativeTransaction(
        nativeTx,
        balanceAfter
      )

      if (!existingTransactions.find(etx => etx.id === transformedTx.id)) {
        newTransactions.push(transformedTx)
      }

      if (nativeTx.operation === 'Credit') {
        currentBalance += nativeTx.value
      } else {
        currentBalance -= nativeTx.value
      }
    })

    const mergedTransactions = GiftCardHistoryService.mergeTransactions(
      existingTransactions,
      newTransactions
    )

    try {
      await updateVoucherDocument(context, mdDoc.id, {
        expirationDate: nativeCard.expiringDate || mdDoc.expirationDate,
        lastSyncedAt: new Date().toISOString(),
        transactions: mergedTransactions,
      })
    } catch (updateError) {
      throw updateError
    }

    return {
      success: true,
      transactionsSynced: newTransactions.length,
      totalTransactions: mergedTransactions.length,
    }
  } catch (error) {
    throw new Error(
      extractErrorMessage(error) || 'Failed to sync voucher history'
    )
  }
}
