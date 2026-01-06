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
  redemptionToken: string // Obrigatório pela API VTEX
  redemptionCode: string // Obrigatório pela API VTEX
  requestId: string // Obrigatório pela API VTEX - deve ser único
}

export interface GiftcardResponse {
  id: string
  redemptionCode: string
  redemptionToken: string
  balance: number
  emissionDate?: string
  expiringDate: string
  currencyCode?: string
  relationName?: string // Apenas no POST, não no GET
  caption?: string // Apenas no POST, não no GET
}

export interface GiftcardTransactionResponse {
  id: string
  operation: string
  value: number
  description: string
  date?: string
  createdAt?: string
}

