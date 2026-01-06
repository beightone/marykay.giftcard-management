export interface CreateGiftcardPayload {
  relationName: string
  expiringDate: string
  caption: string
  profileId: string // Obrigatório pela API VTEX
  restrictedToOwner?: boolean
  currencyCode?: string
  multipleCredits?: boolean
  multipleRedemptions?: boolean
}

export interface CreateGiftcardTransactionPayload {
  operation: string
  value: number
  description: string
}

export interface GiftcardResponse {
  id: string
  redemptionCode: string
  balance: number
  relationName: string
  expiringDate: string
  caption: string
}

export interface GiftcardTransactionResponse {
  id: string
  operation: string
  value: number
  description: string
  date?: string
  createdAt?: string
}

