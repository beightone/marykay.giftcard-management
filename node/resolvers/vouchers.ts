import {
  calculateVoucherStats,
  calculateStatus,
} from '../utils/calculateVoucherStats'
import type { VoucherDocument } from './types'
import { parseTransactions, extractErrorMessage } from './utils'

export const vouchers = async (
  _root: unknown,
  _args: unknown,
  context: Context
) => {
  try {
    const response = await context.clients.masterdata.searchDocuments<VoucherDocument>({
      dataEntity: 'GiftcardManager',
      schema: 'giftcard-manager-v1',
      fields: [
        'id',
        'nativeId',
        'authorEmail',
        'createdAt',
        'ownerCpf',
        'ownerName',
        'initialValue',
        'expirationDate',
        'isReloadable',
        'transactions',
      ],
      pagination: {
        page: 1,
        pageSize: 100,
      },
    })

    const vouchersList = await Promise.all(
      response.map(async (doc: VoucherDocument) => {
        try {
          const nativeCard = await context.clients.giftCardNative.getCard(
            doc.nativeId
          )
          const transactions = parseTransactions(doc.transactions)
          const stats = calculateVoucherStats(transactions)
          const currentBalance = nativeCard.balance ?? 0
          const expirationDate = nativeCard.expiringDate ?? doc.expirationDate ?? ''
          const status = calculateStatus(
            currentBalance,
            expirationDate,
            stats.totalDebited,
            doc.initialValue ?? 0
          )
          const code = nativeCard.redemptionCode ?? ''
          const maskedCode = code
            ? `${code.substring(0, 4)}****${code.substring(code.length - 4)}`
            : ''

          return {
            id: doc.id,
            nativeId: doc.nativeId,
            code: maskedCode,
            currentBalance,
            authorEmail: doc.authorEmail ?? '',
            createdAt: doc.createdAt,
            ownerCpf: doc.ownerCpf ?? '',
            ownerName: doc.ownerName ?? '',
            initialValue: doc.initialValue ?? 0,
            expirationDate,
            isReloadable: doc.isReloadable ?? false,
            status,
            totalCredited: stats.totalCredited,
            totalDebited: stats.totalDebited,
            transactionCount: stats.transactionCount,
          }
        } catch {
          return {
            id: doc.id,
            nativeId: doc.nativeId,
            code: '',
            currentBalance: 0,
            authorEmail: doc.authorEmail ?? '',
            createdAt: doc.createdAt,
            ownerCpf: doc.ownerCpf ?? '',
            ownerName: doc.ownerName ?? '',
            initialValue: doc.initialValue ?? 0,
            expirationDate: doc.expirationDate ?? '',
            isReloadable: doc.isReloadable ?? false,
            status: 'error',
            totalCredited: 0,
            totalDebited: 0,
            transactionCount: 0,
          }
        }
      })
    )

    return vouchersList
  } catch (error) {
    throw new Error(extractErrorMessage(error) ?? 'Failed to fetch vouchers')
  }
}
