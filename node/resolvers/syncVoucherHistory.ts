import { GiftCardHistoryService } from '../services/giftCardHistory'

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

export const syncVoucherHistory = async (
  _root: any,
  args: { nativeId: string },
  context: Context
) => {
  const { nativeId } = args

  try {
    const mdDocs = await context.clients.masterdata.searchDocuments({
      dataEntity: 'GiftCardManager',
      fields: [
        'id',
        'nativeId',
        'expirationDate',
        'initialValue',
        'transactions',
      ],
      where: `nativeId=${nativeId}`,
      pagination: {
        page: 1,
        pageSize: 1,
      },
    })

    if (!mdDocs || mdDocs.length === 0) {
      throw new Error('Voucher not found in MasterData')
    }

    const mdDoc = mdDocs[0]
    const nativeCard = await context.clients.giftCardNative.getCard(nativeId)
    const nativeTransactions = await context.clients.giftCardNative.getTransactions(
      nativeId
    )

    const existingTransactions: any[] = mdDoc.transactions
      ? typeof mdDoc.transactions === 'string'
        ? JSON.parse(mdDoc.transactions)
        : mdDoc.transactions
      : []

    let currentBalance = nativeCard.balance || 0
    const newTransactions: any[] = []

    nativeTransactions.forEach((nativeTx: any, index: number) => {
      const balanceAfter =
        index === 0
          ? currentBalance
          : currentBalance - (nativeTx.operation === 'Debit' ? nativeTx.value : -nativeTx.value)

      const transformedTx = GiftCardHistoryService.transformNativeTransaction(
        nativeTx,
        balanceAfter
      )

      if (!existingTransactions.find((etx) => etx.id === transformedTx.id)) {
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

    await context.clients.masterdata.updateDocument({
      dataEntity: 'GiftCardManager',
      id: mdDoc.id,
      fields: {
        expirationDate: nativeCard.expiringDate || mdDoc.expirationDate,
        lastSyncedAt: new Date().toISOString(),
        transactions: JSON.stringify(mergedTransactions),
      },
    })

    return {
      success: true,
      transactionsSynced: newTransactions.length,
      totalTransactions: mergedTransactions.length,
    }
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to sync voucher history')
  }
}

