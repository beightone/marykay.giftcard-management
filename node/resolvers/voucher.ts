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

export const voucher = async (
  _root: any,
  args: { id: string },
  context: Context
) => {
  try {
    const mdDocs = await context.clients.masterdata.searchDocuments({
      dataEntity: 'GiftCardManager',
      fields: [
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
      ],
      where: `nativeId=${args.id}`,
      pagination: {
        page: 1,
        pageSize: 1,
      },
    })

    if (!mdDocs || mdDocs.length === 0) {
      throw new Error('Voucher not found')
    }

    const mdDoc = mdDocs[0]

    const nativeCard = await context.clients.giftCardNative.getCard(args.id).catch(() => null)

    if (!nativeCard) {
      throw new Error('Gift card not found in native API')
    }

    const transactions: any[] = mdDoc.transactions
      ? typeof mdDoc.transactions === 'string'
        ? JSON.parse(mdDoc.transactions)
        : mdDoc.transactions
      : []

    const stats = calculateVoucherStats(transactions)
    const currentBalance = nativeCard.balance || 0
    const status = calculateStatus(
      currentBalance,
      nativeCard.expiringDate || mdDoc.expirationDate,
      stats.totalDebited,
      mdDoc.initialValue || 0
    )

    const orderIds: string[] = []
    transactions.forEach((tx) => {
      if (tx.orderId) {
        orderIds.push(tx.orderId)
      }
    })

    return {
      id: mdDoc.id,
      nativeId: mdDoc.nativeId,
      code: nativeCard.redemptionCode || '',
      currentBalance,
      authorEmail: mdDoc.authorEmail || '',
      createdAt: mdDoc.createdAt,
      ownerCpf: mdDoc.ownerCpf || '',
      ownerEmail: mdDoc.ownerEmail || '',
      ownerName: mdDoc.ownerName || '',
      initialValue: mdDoc.initialValue || 0,
      expirationDate: nativeCard.expiringDate || mdDoc.expirationDate,
      isReloadable: mdDoc.isReloadable || false,
      caption: nativeCard.caption || '',
      status,
      lastTransactionDate: stats.lastTransactionDate,
      totalCredited: stats.totalCredited,
      totalDebited: stats.totalDebited,
      transactionCount: stats.transactionCount,
      transactions,
      orderIds: [...new Set(orderIds)],
    }
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to fetch voucher')
  }
}
