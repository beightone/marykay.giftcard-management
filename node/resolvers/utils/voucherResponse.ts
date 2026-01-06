import {
  calculateVoucherStats,
  calculateStatus,
} from '../../utils/calculateVoucherStats'
import { extractOrderIds } from './transactions'

export const buildVoucherResponse = (
  mdDoc: any,
  nativeCard: any,
  transactions: any[]
) => {
  const stats = calculateVoucherStats(transactions)
  const currentBalance = nativeCard?.balance || 0
  const expirationDate = nativeCard?.expiringDate || mdDoc.expirationDate
  const status = calculateStatus(
    currentBalance,
    expirationDate,
    stats.totalDebited,
    mdDoc.initialValue || 0
  )
  const orderIds = extractOrderIds(transactions)

  return {
    id: mdDoc.id,
    nativeId: mdDoc.nativeId,
    code: nativeCard?.redemptionCode || '',
    currentBalance,
    authorEmail: mdDoc.authorEmail || '',
    createdAt: mdDoc.createdAt,
    ownerCpf: mdDoc.ownerCpf || '',
    ownerEmail: mdDoc.ownerEmail || '',
    ownerName: mdDoc.ownerName || '',
    initialValue: mdDoc.initialValue || 0,
    expirationDate,
    isReloadable: mdDoc.isReloadable || false,
    caption: nativeCard?.caption || '',
    status,
    lastTransactionDate: stats.lastTransactionDate,
    totalCredited: stats.totalCredited,
    totalDebited: stats.totalDebited,
    transactionCount: stats.transactionCount,
    transactions,
    orderIds,
  }
}
