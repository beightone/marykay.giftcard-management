import type { GiftcardTransactionResponse } from '../types/giftcard.client'

export type Transaction = GiftcardTransactionResponse

// interface GiftCardData {
//   id: string
//   redemptionCode: string
//   balance: number
//   expiringDate: string
// }

export interface MasterDataTransaction {
  id: string
  operation: string
  value: number
  balanceAfter: number
  description: string
  orderId?: string
  orderNumber?: string
  createdAt: string
  createdBy?: string
  source: string
  metadata?: Record<string, any>
}

export class GiftCardHistoryService {
  static parseOrderId(description: string): { orderId?: string; orderNumber?: string } {
    if (!description) return {}

    const orderIdMatch = description.match(/order[_\s]?id[:\s]+([A-Z0-9\-]+)/i)
    const orderNumberMatch = description.match(/order[_\s]?number[:\s]+([0-9]+)/i)

    return {
      orderId: orderIdMatch ? orderIdMatch[1] : undefined,
      orderNumber: orderNumberMatch ? orderNumberMatch[1] : undefined,
    }
  }

  static transformNativeTransaction(
    transaction: Transaction,
    balanceAfter: number,
    authorEmail?: string
  ): MasterDataTransaction {
    const { orderId, orderNumber } = this.parseOrderId(transaction.description || '')

    return {
      id: transaction.id || `native-${Date.now()}`,
      operation: transaction.operation,
      value: transaction.value,
      balanceAfter,
      description: transaction.description || '',
      orderId,
      orderNumber,
      createdAt: transaction.date || transaction.createdAt || new Date().toISOString(),
      createdBy: authorEmail,
      source: 'native-api',
      metadata: {
        nativeTransactionId: transaction.id,
      },
    }
  }

  static calculateTotals(transactions: MasterDataTransaction[]): {
    totalCredited: number
    totalDebited: number
    transactionCount: number
  } {
    let totalCredited = 0
    let totalDebited = 0

    transactions.forEach((tx) => {
      if (tx.operation === 'Credit') {
        totalCredited += tx.value
      } else if (tx.operation === 'Debit') {
        totalDebited += tx.value
      }
    })

    return {
      totalCredited,
      totalDebited,
      transactionCount: transactions.length,
    }
  }

  static mergeTransactions(
    existing: MasterDataTransaction[],
    newTransactions: MasterDataTransaction[]
  ): MasterDataTransaction[] {
    const transactionMap = new Map<string, MasterDataTransaction>()

    existing.forEach((tx) => {
      transactionMap.set(tx.id, tx)
    })

    newTransactions.forEach((tx) => {
      if (!transactionMap.has(tx.id)) {
        transactionMap.set(tx.id, tx)
      }
    })

    return Array.from(transactionMap.values()).sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }

  static determineStatus(
    currentBalance: number,
    expirationDate: string,
    totalDebited: number,
    initialValue: number
  ): 'active' | 'expired' | 'used' | 'cancelled' {
    const now = new Date()
    const expDate = new Date(expirationDate)

    if (expDate < now) {
      return 'expired'
    }

    if (currentBalance === 0 && totalDebited >= initialValue) {
      return 'used'
    }

    if (currentBalance < 0) {
      return 'cancelled'
    }

    return 'active'
  }
}
