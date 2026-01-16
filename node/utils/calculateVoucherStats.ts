interface Transaction {
  operation: string
  value: number
  createdAt?: string
}

export const calculateVoucherStats = (transactions: Transaction[]) => {
  let totalCredited = 0
  let totalDebited = 0

  transactions.forEach(tx => {
    if (tx.operation === 'Credit') {
      totalCredited += tx.value
    } else if (tx.operation === 'Debit') {
      totalDebited += tx.value
    }
  })

  const lastTransaction =
    transactions.length > 0 ? transactions[transactions.length - 1] : null

  return {
    totalCredited,
    totalDebited,
    transactionCount: transactions.length,
    lastTransactionDate: lastTransaction?.createdAt ?? null,
  }
}

export const calculateStatus = (
  currentBalance: number,
  expirationDate: string,
  totalDebited: number,
  initialValue: number
): 'active' | 'expired' | 'used' | 'cancelled' => {
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

