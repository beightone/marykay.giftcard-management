export interface Context {
  clients: {
    giftCardNative?: any
    masterdata: any
  }
  vtex: {
    account: string
    workspace: string
    adminUserAuthToken?: string
    authToken?: string
  }
}

