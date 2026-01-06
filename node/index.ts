import { Service } from '@vtex/api'

import { Clients } from './clients'
import { createVoucher } from './resolvers/createVoucher'
import { vouchers } from './resolvers/vouchers'
import { voucher } from './resolvers/voucher'
import { searchClientByCpf } from './resolvers/searchClientByCpf'
import { syncVoucherHistory } from './resolvers/syncVoucherHistory'
import { adjustVoucherBalance } from './resolvers/adjustVoucherBalance'
import { deleteVoucher } from './resolvers/deleteVoucher'

const clients = {
  implementation: Clients,
  options: {},
}

export default new Service({
  clients,
  graphql: {
    resolvers: {
      Query: {
        vouchers,
        voucher,
        searchClientByCpf,
      },
      Mutation: {
        createVoucher,
        syncVoucherHistory,
        adjustVoucherBalance,
        deleteVoucher,
      },
    },
  },
})
