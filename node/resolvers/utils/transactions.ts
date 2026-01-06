export const parseTransactions = (transactions: any): any[] => {
  if (!transactions) {
    return []
  }

  return typeof transactions === 'string'
    ? JSON.parse(transactions)
    : transactions
}

export const extractOrderIds = (transactions: any[]): string[] => {
  const orderIds: string[] = []

  transactions.forEach(tx => {
    if (tx.orderId) {
      orderIds.push(tx.orderId)
    }
  })

  return [...new Set(orderIds)]
}

