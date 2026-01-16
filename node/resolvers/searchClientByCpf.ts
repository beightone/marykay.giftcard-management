import type { Context, ClientProfile } from './types'

export const searchClientByCpf = async (
  _root: unknown,
  args: { cpf: string },
  context: Context
) => {
  try {
    const response = await context.clients.masterdata.searchDocuments<ClientProfile & { id: string }>({
      dataEntity: 'CL',
      fields: ['id', 'document', 'firstName', 'lastName', 'email'],
      where: `document=${args.cpf}`,
      pagination: {
        page: 1,
        pageSize: 10,
      },
    })

    return (
      response?.map(doc => ({
        id: doc.id,
        document: doc.document ?? args.cpf,
        firstName: doc.firstName ?? '',
        lastName: doc.lastName ?? '',
        email: doc.email ?? '',
      })) ?? []
    )
  } catch {
    return []
  }
}
