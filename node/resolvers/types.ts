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

