import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type {
  CreateGiftcardPayload,
  CreateGiftcardTransactionPayload,
  GiftcardResponse,
  GiftcardTransactionResponse,
} from '../types/giftcard.client'

export class GiftCardNative extends ExternalClient {
  constructor(ctx: IOContext, opts?: InstanceOptions) {
    super(`http://${ctx.account}.myvtex.com`, ctx, {
      ...opts,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        VtexIdclientAutCookie: ctx.adminUserAuthToken ?? ctx.authToken ?? '',
        'X-Vtex-Use-HTTPS': 'true',
      },
    })
  }

  private get routes() {
    return {
      getById: (id: string) => `/api/giftcards/${id}`,
      create: () => '/api/giftcards',
      createTransaction: (id: string) => `/api/giftcards/${id}/transactions`,
      getTransactions: (id: string) => `/api/giftcards/${id}/transactions`,
    }
  }

  public async createCard(
    payload: CreateGiftcardPayload
  ): Promise<GiftcardResponse> {
    return this.http.post<GiftcardResponse>(this.routes.create(), payload, {
      metric: 'giftcards-create',
      timeout: 15000,
    })
  }

  public async createTransaction(
    giftCardId: string,
    payload: CreateGiftcardTransactionPayload
  ): Promise<GiftcardTransactionResponse> {
    return this.http.post<GiftcardTransactionResponse>(
      this.routes.createTransaction(giftCardId),
      payload,
      {
        metric: 'giftcards-create-transaction',
        timeout: 15000,
      }
    )
  }

  public async getCard(id: string): Promise<GiftcardResponse> {
    try {
      const response = await this.http.get<GiftcardResponse>(
        this.routes.getById(id),
        {
          metric: 'giftcards-getById',
          timeout: 15000,
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  public async getTransactions(
    id: string
  ): Promise<GiftcardTransactionResponse[]> {
    return this.http.get<GiftcardTransactionResponse[]>(
      this.routes.getTransactions(id),
      {
        metric: 'giftcards-getTransactions',
        timeout: 15000,
      }
    )
  }
}
