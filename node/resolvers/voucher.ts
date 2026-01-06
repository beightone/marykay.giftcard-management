import {
  calculateVoucherStats,
  calculateStatus,
} from '../utils/calculateVoucherStats'
import type { Context } from './types'
import {
  searchVoucherByNativeId,
  searchVoucherById,
  parseTransactions,
  buildVoucherResponse,
  extractErrorMessage,
} from './utils'

export const voucher = async (
  _root: any,
  args: { id: string },
  context: Context
) => {
  try {
    const mdDoc =
      (await searchVoucherByNativeId(context, args.id)) ||
      (await searchVoucherById(context, args.id))

    if (!mdDoc) {
      throw new Error('Voucher not found in MasterData')
    }

    const nativeId = mdDoc.nativeId || args.id
    let nativeCard: any = null

    try {
      nativeCard = await context.clients.giftCardNative!.getCard(nativeId)
    } catch {
      const transactions = parseTransactions(mdDoc.transactions)
      const stats = calculateVoucherStats(transactions)
      const status = calculateStatus(
        0,
        mdDoc.expirationDate,
        stats.totalDebited,
        mdDoc.initialValue || 0
      )

      return {
        id: mdDoc.id,
        nativeId: mdDoc.nativeId,
        code: 'N/A',
        currentBalance: 0,
        authorEmail: mdDoc.authorEmail || '',
        createdAt: mdDoc.createdAt,
        ownerCpf: mdDoc.ownerCpf || '',
        ownerEmail: mdDoc.ownerEmail || '',
        ownerName: mdDoc.ownerName || '',
        initialValue: mdDoc.initialValue || 0,
        expirationDate: mdDoc.expirationDate,
        isReloadable: mdDoc.isReloadable || false,
        caption: 'N/A',
        status,
        lastTransactionDate: stats.lastTransactionDate,
        totalCredited: stats.totalCredited,
        totalDebited: stats.totalDebited,
        transactionCount: stats.transactionCount,
        transactions,
        orderIds: [],
      }
    }

    const transactions = parseTransactions(mdDoc.transactions)

    return buildVoucherResponse(mdDoc, nativeCard, transactions)
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}
