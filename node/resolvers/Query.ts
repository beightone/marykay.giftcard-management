import { vouchers } from './vouchers'
import { voucher } from './voucher'
import { searchClientByCpf } from './searchClientByCpf'
import { vouchersByUser } from './vouchersByUser'

export const Query = {
  vouchers: async (_: any, __: any, ctx: Context) => {
    return vouchers(_, __, ctx)
  },

  voucher: async (_: any, args: { id: string }, ctx: Context) => {
    return voucher(_, args, ctx)
  },

  searchClientByCpf: async (_: any, args: { cpf: string }, ctx: Context) => {
    return searchClientByCpf(_, args, ctx)
  },

  vouchersByUser: async (
    _: any,
    args: { userId?: string; cpf?: string },
    ctx: Context
  ) => {
    return vouchersByUser(_, args, ctx)
  },
}
