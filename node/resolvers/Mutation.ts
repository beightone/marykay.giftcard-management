import { createVoucher } from './createVoucher'
import { syncVoucherHistory } from './syncVoucherHistory'
import { adjustVoucherBalance } from './adjustVoucherBalance'
import { deleteVoucher } from './deleteVoucher'

export const Mutation = {
  createVoucher: async (_: any, args: any, ctx: Context) => {
    return createVoucher(_, args, ctx)
  },

  syncVoucherHistory: async (
    _: any,
    args: { nativeId: string },
    ctx: Context
  ) => {
    return syncVoucherHistory(_, args, ctx)
  },

  adjustVoucherBalance: async (_: any, args: any, ctx: Context) => {
    return adjustVoucherBalance(_, args, ctx)
  },

  deleteVoucher: async (_: any, args: { nativeId: string }, ctx: Context) => {
    return deleteVoucher(_, args, ctx)
  },
}
