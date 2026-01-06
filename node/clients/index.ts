import { IOClients, MasterData } from '@vtex/api'
import { GiftCardNative } from './giftcard'

export class Clients extends IOClients {
  public get giftCardNative() {
    return this.getOrSet('giftCardNative', GiftCardNative)
  }

  public get masterdata() {
    return this.getOrSet('masterdata', MasterData)
  }
}
