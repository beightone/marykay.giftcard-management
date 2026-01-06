import React from 'react'
import { Input, Button } from 'vtex.styleguide'
import { Query } from 'react-apollo'
import SEARCH_CLIENT_BY_CPF from '../graphql/queries/search-client-by-cpf.gql'

interface Client {
  id: string
  document: string
  firstName: string
  lastName: string
  email: string
}

interface ClientSearchProps {
  cpf: string
  selectedClient: Client | null
  onCpfChange: (cpf: string) => void
  onClientSelect: (client: Client) => void
  onClear: () => void
}

const ClientSearch: React.FC<ClientSearchProps> = ({
  cpf,
  selectedClient,
  onCpfChange,
  onClientSelect,
  onClear,
}) => {
  const shouldSearch = cpf && cpf.length >= 11 && !selectedClient

  return (
    <div>
      <Input
        label="Client CPF"
        value={cpf}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onCpfChange(e.target.value)
        }
        placeholder="Enter CPF to search client"
      />
      {shouldSearch && (
        <Query query={SEARCH_CLIENT_BY_CPF} variables={{ cpf }} skip={!shouldSearch}>
          {({ data }: any) => {
            const clients = data?.searchClientByCpf || []
            return (
              <>
                {clients.length > 0 && (
                  <div className="mt3">
                    {clients.map((client: Client) => (
                      <div
                        key={client.id}
                        className="pa3 mb2 bg-muted-5 pointer hover-bg-muted-4"
                        onClick={() => onClientSelect(client)}
                      >
                        {client.firstName} {client.lastName} - {client.email} (
                        {client.document})
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          }}
        </Query>
      )}
      {selectedClient && (
        <div className="mt3 pa3 bg-success--faded flex items-center justify-between">
          <span>
            Selected: {selectedClient.firstName} {selectedClient.lastName}
          </span>
          <Button size="small" variation="tertiary" onClick={onClear}>
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}

export default ClientSearch

