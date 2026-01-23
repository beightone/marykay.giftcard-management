import { searchVoucherByNativeId, extractErrorMessage } from './utils'

export const deleteVoucher = async (
  _root: unknown,
  args: { nativeId: string },
  context: Context
) => {
  try {
    const mdDoc = await searchVoucherByNativeId(context, args.nativeId, ['id'])

    if (!mdDoc) {
      throw new Error('Voucher not found in MasterData')
    }

    await context.clients.masterdata.deleteDocument({
      dataEntity: 'GiftcardManager',
      id: mdDoc.id,
    })

    return true
  } catch (error) {
    throw new Error(extractErrorMessage(error) || 'Failed to delete voucher')
  }
}
