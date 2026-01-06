interface Context {
  clients: {
    masterdata: any
  }
  vtex: {
    account: string
    workspace: string
  }
}

export const searchClientByCpf = async (
  _root: any,
  args: { cpf: string },
  context: Context
) => {
  try {
    const response = await context.clients.masterdata.searchDocuments({
      dataEntity: 'CL',
      fields: ['id', 'document', 'firstName', 'lastName', 'email'],
      where: `document=${args.cpf}`,
      pagination: {
        page: 1,
        pageSize: 10,
      },
    })

    return (
      response?.map((doc: any) => ({
        id: doc.id,
        document: doc.document || args.cpf,
        firstName: doc.firstName || '',
        lastName: doc.lastName || '',
        email: doc.email || '',
      })) || []
    )
  } catch (error: any) {
    return []
  }
}
