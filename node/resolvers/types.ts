import type { MasterData } from '@vtex/api'

import type { GiftCardNative } from '../clients/giftcard'

export interface Context {
  clients: {
    giftCardNative: GiftCardNative
    masterdata: MasterData
  }
  vtex: {
    account: string
    workspace: string
    adminUserAuthToken?: string
    authToken?: string
    logger: {
      info: (message: string | Record<string, unknown>) => void
      warn: (message: string | Record<string, unknown>) => void
      error: (message: string | Record<string, unknown>) => void
      debug: (message: string | Record<string, unknown>) => void
    }
  }
}

// Voucher document stored in MasterData
export interface VoucherDocument {
  id: string
  nativeId: string
  authorEmail?: string
  createdAt?: string
  ownerCpf?: string
  ownerEmail?: string
  ownerName?: string
  initialValue?: number
  expirationDate?: string
  isReloadable?: boolean
  transactions?: string | TransactionRecord[]
}

// Transaction record stored in MasterData
export interface TransactionRecord {
  id: string
  operation: string
  value: number
  balanceAfter?: number
  description?: string
  orderId?: string
  orderNumber?: string
  createdAt?: string
  createdBy?: string
  source?: string
  metadata?: Record<string, unknown>
}

// Client profile from CL entity
export interface ClientProfile {
  userId?: string
  email?: string
  firstName?: string
  lastName?: string
  document?: string
}

