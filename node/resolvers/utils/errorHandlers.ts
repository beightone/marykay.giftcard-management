import { extractErrorDetails, extractErrorMessage } from './errors'

export const handleMasterDataError = (
  error: any,
  nativeCardId: string,
  documentToSave: Record<string, unknown>,
  context: Context
) => {
  const errorInfo = extractErrorDetails(error)
  const errorResponse = error?.response?.data || {}

  const errorDetails = {
    message: 'Failed to create MasterData document',
    error: errorInfo.message,
    errorStatus: errorInfo.status,
    errorResponse: typeof errorResponse === 'object'
      ? JSON.stringify(errorResponse)
      : String(errorResponse),
    nativeCardId,
    documentKeys: Object.keys(documentToSave),
  }

  context.vtex.logger.error(errorDetails)

  console.error('MasterData Error:', errorInfo.message)
  console.error('MasterData Status:', errorInfo.status)
  console.error('MasterData Response:', typeof errorResponse === 'object'
    ? JSON.stringify(errorResponse)
    : errorResponse)
}

export const handleCreateVoucherError = (
  error: any,
  nativeCardId: string | null | undefined,
  input: {
    initialValue: number
    expirationDate: string
    ownerCpf?: string
    relationName: string
  },
  context: Context
) => {
  const errorMessage = extractErrorMessage(error)

  const logData = {
    message: 'Error creating voucher',
    error: errorMessage,
    nativeCardId,
    input: {
      initialValue: input.initialValue,
      expirationDate: input.expirationDate,
      ownerCpf: input.ownerCpf,
      relationName: input.relationName,
    },
  }

  context.vtex.logger.error(logData)
  console.error('Error creating voucher:', errorMessage)
  console.error('Native Card ID:', nativeCardId)
}
