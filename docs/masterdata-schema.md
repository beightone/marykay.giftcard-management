# MasterData V2 Schema - GiftCard Entity (GC)

Este documento contém o schema completo para criação da entidade `GC` no MasterData V2.

## Entidade: GC (GiftCard)

### Análise de Campos

**Campos da API Nativa (sempre atualizados em tempo real):**
- `redemptionCode` - Buscado da API nativa
- `currentBalance` - Buscado da API nativa (balance)
- `expirationDate` - Buscado da API nativa (expiringDate)
- `caption` - Buscado da API nativa

**Campos Calculáveis (podem ser calculados de outros campos):**
- `status` - Calculado de expirationDate e balance
- `lastTransactionDate` - Calculado de transactions (último elemento)
- `totalCredited`, `totalDebited`, `transactionCount` - Calculados de transactions

**Campos Essenciais (metadados que API nativa não tem):**
- `nativeId` - Chave de ligação entre sistemas
- `authorEmail` - Quem criou (API nativa não tem)
- `createdAt` - Quando foi criado no nosso sistema
- `ownerCpf`, `ownerEmail`, `ownerName` - Metadados do dono
- `initialValue` - Valor inicial (API não armazena)
- `isReloadable` - Configuração
- `transactions` - Histórico completo com metadados
- `lastSyncedAt` - Controle de sincronização

### Schema JSON para criação via API ou Admin

```json
{
  "title": "Gift Card",
  "type": "object",
  "v-schema": "giftcard-v1",
  "v-cache": false,
  "v-indexed": [
    "nativeId",
    "authorEmail",
    "ownerCpf",
    "ownerEmail",
    "createdAt",
    "expirationDate"
  ],
  "v-default-fields": [
    "nativeId",
    "authorEmail",
    "createdAt"
  ],
  "v-security": {
    "publicJsonSchema": true,
    "allowGetAll": false,
    "publicRead": [],
    "publicWrite": [],
    "publicFilter": []
  },
  "required": [
    "nativeId",
    "authorEmail",
    "createdAt",
    "initialValue",
    "expirationDate"
  ],
  "properties": {
    "nativeId": {
      "type": "string",
      "title": "Native GiftCard ID",
      "description": "ID do giftcard na API nativa do VTEX"
    },
    "authorEmail": {
      "type": "string",
      "format": "email",
      "title": "Author Email",
      "description": "Email do administrador que criou o giftcard"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "title": "Created At",
      "description": "Data e hora de criação do giftcard"
    },
    "ownerCpf": {
      "type": "string",
      "title": "Owner CPF",
      "description": "CPF do dono do giftcard (opcional, usado quando restrito)"
    },
    "ownerEmail": {
      "type": "string",
      "format": "email",
      "title": "Owner Email",
      "description": "Email do dono do giftcard"
    },
    "ownerName": {
      "type": "string",
      "title": "Owner Name",
      "description": "Nome completo do dono do giftcard"
    },
    "initialValue": {
      "type": "number",
      "title": "Initial Value",
      "description": "Valor inicial do giftcard"
    },
    "expirationDate": {
      "type": "string",
      "format": "date-time",
      "title": "Expiration Date",
      "description": "Data de expiração do giftcard (também disponível na API nativa, mas armazenado para indexação)"
    },
    "isReloadable": {
      "type": "boolean",
      "title": "Is Reloadable",
      "description": "Se o giftcard pode ser recarregado"
    },
    "lastSyncedAt": {
      "type": "string",
      "format": "date-time",
      "title": "Last Synced At",
      "description": "Data da última sincronização com a API nativa"
    },
    "transactions": {
      "type": "array",
      "title": "Transactions History",
      "description": "Array JSON com histórico detalhado de transações",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "operation": {
            "type": "string",
            "enum": ["Credit", "Debit"]
          },
          "value": {
            "type": "number"
          },
          "balanceAfter": {
            "type": "number"
          },
          "description": {
            "type": "string"
          },
          "orderId": {
            "type": "string"
          },
          "orderNumber": {
            "type": "string"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdBy": {
            "type": "string",
            "format": "email"
          },
          "source": {
            "type": "string"
          },
          "metadata": {
            "type": "object"
          }
        }
      }
    }
  }
}
```

### Campos Removidos (Redundantes)

Os seguintes campos foram removidos porque são sempre buscados da API nativa ou calculáveis:

- **`redemptionCode`** - Sempre vem da API nativa em tempo real
- **`currentBalance`** - Sempre vem da API nativa (`balance`) em tempo real
- **`caption`** - Vem da API nativa
- **`status`** - Pode ser calculado de `expirationDate` e `currentBalance` (mas mantido no código para facilitar filtros)
- **`lastTransactionDate`** - Pode ser calculado do array `transactions` (último elemento)
- **`totalCredited`** - Pode ser calculado somando todas as transações de tipo "Credit"
- **`totalDebited`** - Pode ser calculado somando todas as transações de tipo "Debit"
- **`transactionCount`** - Pode ser calculado pelo tamanho do array `transactions`

### Estrutura do Campo `transactions`

O campo `transactions` armazena um array de objetos com a seguinte estrutura:

```json
[
  {
    "id": "transaction-id-from-native-api",
    "operation": "Credit",
    "value": 100.00,
    "balanceAfter": 100.00,
    "description": "Initial credit",
    "orderId": "order-id-if-applicable",
    "orderNumber": "123456",
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": "admin@example.com",
    "source": "native-api",
    "metadata": {
      "nativeTransactionId": "native-id",
      "additionalInfo": "any-additional-data"
    }
  }
]
```

### Campos Indexados

Os seguintes campos são indexados para facilitar buscas:
- `nativeId` - Busca por ID nativo
- `authorEmail` - Filtrar por criador
- `ownerCpf` - Filtrar por CPF do dono
- `ownerEmail` - Filtrar por email do dono
- `createdAt` - Ordenação e filtros por data
- `expirationDate` - Busca por data de expiração

### Campos Obrigatórios (required)

- `nativeId` - ID do giftcard na API nativa
- `authorEmail` - Email do criador
- `createdAt` - Data de criação
- `initialValue` - Valor inicial
- `expirationDate` - Data de expiração

## Como Criar a Entidade

1. Acesse o MasterData V2 Admin: `/admin/apps/vtex.master-data/MasterDataEntities`
2. Crie uma nova entidade com o nome `GC`
3. Cole o schema JSON acima no campo de schema
4. Configure as permissões conforme necessário
5. Salve a entidade

Ou via API:

```bash
POST /api/dataentities/GC/schemas
Content-Type: application/json
Authorization: Bearer {token}

{...schema json acima...}
```

## Notas Importantes

- Campos como `redemptionCode`, `currentBalance`, `caption` são sempre buscados da API nativa em tempo real
- Campos agregados (`totalCredited`, `totalDebited`, `transactionCount`, `lastTransactionDate`, `status`) são calculados dinamicamente no resolver
- O campo `transactions` é do tipo `array` e armazena o histórico completo de transações
- Campos de data devem estar no formato ISO 8601 (`date-time`)
- Campos indexados permitem buscas eficientes no MasterData V2
