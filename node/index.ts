import type { ServiceContext, RecorderState } from '@vtex/api'
import { Service, method } from '@vtex/api'

import { Clients } from './clients'
import { createVoucher } from './resolvers/createVoucher'
import { vouchers } from './resolvers/vouchers'
import { voucher } from './resolvers/voucher'
import { searchClientByCpf } from './resolvers/searchClientByCpf'
import { vouchersByUser } from './resolvers/vouchersByUser'
import { syncVoucherHistory } from './resolvers/syncVoucherHistory'
import { adjustVoucherBalance } from './resolvers/adjustVoucherBalance'
import { deleteVoucher } from './resolvers/deleteVoucher'
import {
  restQueryHandler,
  restMutationHandler,
} from './handlers/RestGraphqlHandler'

declare global {
  type Context = ServiceContext<Clients, State>

  interface State extends RecorderState {
    code: number
  }
}

const Query = {
  vouchers,
  voucher,
  searchClientByCpf,
  vouchersByUser,
}

const Mutation = {
  createVoucher,
  syncVoucherHistory,
  adjustVoucherBalance,
  deleteVoucher,
}

export { Query, Mutation }

const clients = {
  implementation: Clients,
  options: {},
}

export default new Service({
  clients,
  graphql: {
    resolvers: {
      Query,
      Mutation,
    },
  },
  routes: {
    giftcardQuery: method({
      GET: [restQueryHandler],
      POST: [restQueryHandler],
    }),
    giftcardMutation: method({
      POST: [restMutationHandler],
    }),
  },
})
