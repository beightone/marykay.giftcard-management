import { calculateVoucherStats, calculateStatus } from '../utils/calculateVoucherStats'

interface Context {
  clients: {
    masterdata: any
    giftCardNative: any
  }
  vtex: {
    account: string
    workspace: string
  }
}

export const vouchers = async (
  _root: any,
  _args: any,
  context: Context
) => {
  try {
    const response = await context.clients.masterdata.searchDocuments({
      dataEntity: 'GiftCardManager',
      fields: [
        'id',
        'nativeId',
        'authorEmail',
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

    const vouchers = await Promise.all(
      response.map(async (doc: any) => {
        try {
          const nativeCard = await context.clients.giftCardNative.getCard(
            doc.nativeId
          )

          const transactions: any[] = doc.transactions
            ? typeof doc.transactions === 'string'
              ? JSON.parse(doc.transactions)
              : doc.transactions
            : []

          const stats = calculateVoucherStats(transactions)
          const currentBalance = nativeCard.balance || 0
          const expirationDate = nativeCard.expiringDate || doc.expirationDate
          const status = calculateStatus(
            currentBalance,
            expirationDate,
            stats.totalDebited,
            doc.initialValue || 0
          )

          const code = nativeCard.redemptionCode || ''
          const maskedCode = code
            ? `${code.substring(0, 4)}****${code.substring(code.length - 4)}`
            : ''

          return {
            id: doc.id,
            nativeId: doc.nativeId,
            code: maskedCode,
            currentBalance,
            authorEmail: doc.authorEmail || '',
            ownerCpf: doc.ownerCpf || '',
            ownerName: doc.ownerName || '',
            initialValue: doc.initialValue || 0,
            expirationDate,
            isReloadable: doc.isReloadable || false,
            status,
            totalCredited: stats.totalCredited,
            totalDebited: stats.totalDebited,
            transactionCount: stats.transactionCount,
          }
        } catch (error) {
          return {
            id: doc.id,
            nativeId: doc.nativeId,
            code: '',
            currentBalance: 0,
            authorEmail: doc.authorEmail || '',
            ownerCpf: doc.ownerCpf || '',
            ownerName: doc.ownerName || '',
            initialValue: doc.initialValue || 0,
            expirationDate: doc.expirationDate,
            isReloadable: doc.isReloadable || false,
            status: 'error',
            totalCredited: 0,
            totalDebited: 0,
            transactionCount: 0,
          }
        }
      })
    )

    return vouchers
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to fetch vouchers')
  }
}
