import {
  calculateVoucherStats,
  calculateStatus,
} from '../utils/calculateVoucherStats'
import { ClientProfile, VoucherDocument } from './types'
import { parseTransactions, extractErrorMessage } from './utils'

const findCpfByUserId = async (
  context: Context,
  userId: string
): Promise<string | null> => {
  try {
    const response = await context.clients.masterdata.searchDocuments<
      ClientProfile
    >({
      dataEntity: 'CL',
      fields: ['document'],
      where: `userId=${userId}`,
      pagination: {
        page: 1,
        pageSize: 1,
      },
    })

    return response && response.length > 0 ? response[0].document ?? null : null
  } catch {
    return null
  }
}

export const vouchersByUser = async (
  _root: unknown,
  args: { userId?: string; cpf?: string },
  context: Context
) => {
  try {
    let cpf: string | null = null

    if (args.userId) {
      cpf = await findCpfByUserId(context, args.userId)
      if (!cpf) {
        return []
      }
    } else if (args.cpf) {
      cpf = args.cpf
    } else {
      throw new Error('Either userId or cpf must be provided')
    }

    const response = await context.clients.masterdata.searchDocuments<
      VoucherDocument
    >({
      dataEntity: 'GiftcardManager',
      schema: 'giftcard-manager-v1',
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
      where: `ownerCpf=${cpf}`,
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
          const expirationDate =
            nativeCard.expiringDate ?? doc.expirationDate ?? ''
          const status = calculateStatus(
            currentBalance,
            expirationDate,
            stats.totalDebited,
            doc.initialValue ?? 0
          )
          const code = nativeCard.redemptionCode ?? ''

          return {
            id: doc.id,
            nativeId: doc.nativeId,
            code,
            currentBalance,
            authorEmail: doc.authorEmail ?? '',
            createdAt: doc.createdAt,
            ownerCpf: doc.ownerCpf ?? '',
            ownerEmail: doc.ownerEmail ?? '',
            ownerName: doc.ownerName ?? '',
            initialValue: doc.initialValue ?? 0,
            expirationDate,
            isReloadable: doc.isReloadable ?? false,
            status,
            lastTransactionDate: stats.lastTransactionDate,
            totalCredited: stats.totalCredited,
            totalDebited: stats.totalDebited,
            transactionCount: stats.transactionCount,
            transactions,
            orderIds: transactions
              .filter(tx => tx.orderId)
              .map(tx => tx.orderId!)
              .filter((id, index, self) => self.indexOf(id) === index),
          }
        } catch {
          const transactions = parseTransactions(doc.transactions)
          const stats = calculateVoucherStats(transactions)
          const status = calculateStatus(
            0,
            doc.expirationDate ?? '',
            stats.totalDebited,
            doc.initialValue ?? 0
          )

          return {
            id: doc.id,
            nativeId: doc.nativeId,
            code: '',
            currentBalance: 0,
            authorEmail: doc.authorEmail ?? '',
            createdAt: doc.createdAt,
            ownerCpf: doc.ownerCpf ?? '',
            ownerEmail: doc.ownerEmail ?? '',
            ownerName: doc.ownerName ?? '',
            initialValue: doc.initialValue ?? 0,
            expirationDate: doc.expirationDate ?? '',
            isReloadable: doc.isReloadable ?? false,
            status,
            lastTransactionDate: stats.lastTransactionDate,
            totalCredited: stats.totalCredited,
            totalDebited: stats.totalDebited,
            transactionCount: stats.transactionCount,
            transactions,
            orderIds: transactions
              .filter(tx => tx.orderId)
              .map(tx => tx.orderId!)
              .filter((id, index, self) => self.indexOf(id) === index),
          }
        }
      })
    )

    return vouchersList
  } catch (error) {
    throw new Error(
      extractErrorMessage(error) ?? 'Failed to fetch vouchers by user'
    )
  }
}
