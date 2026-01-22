# API Documentation - Gift Card Management

Esta documentação descreve todas as formas de acesso à API de gerenciamento de gift cards (vouchers), incluindo **GraphQL** e **REST API**.

## Índice

1. [Autenticação](#autenticação)
2. [Tratamento de Erros](#tratamento-de-erros)
3. [GraphQL API](#graphql-api)
   - [Queries](#queries)
   - [Mutations](#mutations)
4. [REST API](#rest-api)
   - [Queries REST](#queries-rest)
   - [Mutations REST](#mutations-rest)
5. [Exemplos de Uso](#exemplos-de-uso)
6. [Integração com My Account e Checkout](#integração-com-my-account-e-checkout)

---

## Autenticação

Todas as APIs são públicas e não requerem autenticação adicional. A autenticação é gerenciada internamente pela plataforma VTEX IO.

**Base URL:**
- GraphQL: `https://{account}.myvtex.com/_v/private/vtex.giftcard-manager@0.0.12/graphiql/v1`
- REST: `https://{account}.myvtex.com/_v/giftcard`

---

## Tratamento de Erros

### GraphQL

Erros são retornados no formato padrão do GraphQL:

```json
{
  "errors": [
    {
      "message": "Mensagem descritiva do erro",
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ],
  "data": null
}
```

### REST API

Erros são retornados com status HTTP apropriado e corpo JSON:

**Formato do Erro (400/404/500):**
```json
{
  "error": "Mensagem descritiva do erro."
}
```

**Formato de Sucesso (200):**
```json
{
  "data": { ... }
}
```

---

## GraphQL API

### Queries

#### 1. Listar Todos os Gift Cards

Retorna uma lista de todos os gift cards cadastrados no sistema.

**GraphQL Query:**
```graphql
query {
  vouchers {
    id
    nativeId
    code
    currentBalance
    authorEmail
    createdAt
    ownerCpf
    ownerName
    initialValue
    expirationDate
    isReloadable
    status
    totalCredited
    totalDebited
    transactionCount
  }
}
```

**Resposta:**
```json
{
  "data": {
    "vouchers": [
      {
        "id": "12345",
        "nativeId": "native-123",
        "code": "ABCD****EFGH",
        "currentBalance": 150.50,
        "authorEmail": "admin@example.com",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "ownerCpf": "12345678900",
        "ownerName": "João Silva",
        "initialValue": 200.00,
        "expirationDate": "2025-01-15",
        "isReloadable": true,
        "status": "active",
        "totalCredited": 250.00,
        "totalDebited": 99.50,
        "transactionCount": 5
      }
    ]
  }
}
```

---

#### 2. Buscar Gift Card por ID

Retorna os detalhes completos de um gift card específico, incluindo histórico de transações.

**GraphQL Query:**
```graphql
query GetVoucher($id: ID!) {
  voucher(id: $id) {
    id
    nativeId
    code
    currentBalance
    authorEmail
    createdAt
    ownerCpf
    ownerEmail
    ownerName
    initialValue
    expirationDate
    isReloadable
    caption
    status
    lastTransactionDate
    totalCredited
    totalDebited
    transactionCount
    transactions {
      id
      operation
      value
      balanceAfter
      description
      orderId
      orderNumber
      createdAt
      createdBy
      source
      metadata
    }
    orderIds
  }
}
```

**Variáveis:**
```json
{
  "id": "native-123"
}
```

**Resposta:**
```json
{
  "data": {
    "voucher": {
      "id": "12345",
      "nativeId": "native-123",
      "code": "ABCD1234EFGH",
      "currentBalance": 150.50,
      "authorEmail": "admin@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "ownerCpf": "12345678900",
      "ownerEmail": "joao@example.com",
      "ownerName": "João Silva",
      "initialValue": 200.00,
      "expirationDate": "2025-01-15",
      "isReloadable": true,
      "caption": "Gift Card Promocional",
      "status": "active",
      "lastTransactionDate": "2024-02-10T14:20:00.000Z",
      "totalCredited": 250.00,
      "totalDebited": 99.50,
      "transactionCount": 5,
      "transactions": [
        {
          "id": "tx-001",
          "operation": "Credit",
          "value": 200.00,
          "balanceAfter": 200.00,
          "description": "Initial credit - 200",
          "orderId": null,
          "orderNumber": null,
          "createdAt": "2024-01-15T10:30:00.000Z",
          "createdBy": "admin@example.com",
          "source": "manual",
          "metadata": null
        }
      ],
      "orderIds": ["vtex-order-123"]
    }
  }
}
```

---

#### 3. Buscar Cliente por CPF

Busca informações de clientes cadastrados no MasterData pelo CPF.

**GraphQL Query:**
```graphql
query SearchClient($cpf: String!) {
  searchClientByCpf(cpf: $cpf) {
    id
    document
    firstName
    lastName
    email
  }
}
```

**Variáveis:**
```json
{
  "cpf": "12345678900"
}
```

**Resposta:**
```json
{
  "data": {
    "searchClientByCpf": [
      {
        "id": "client-123",
        "document": "12345678900",
        "firstName": "João",
        "lastName": "Silva",
        "email": "joao@example.com"
      }
    ]
  }
}
```

---

#### 4. Buscar Gift Cards por Usuário (userId ou CPF)

Retorna todos os gift cards de um usuário específico. Pode buscar por `userId` ou `cpf`. Se fornecer `userId`, o sistema busca o CPF correspondente automaticamente.

**GraphQL Query:**
```graphql
query GetUserVouchers($userId: String, $cpf: String) {
  vouchersByUser(userId: $userId, cpf: $cpf) {
    id
    nativeId
    code
    currentBalance
    authorEmail
    createdAt
    ownerCpf
    ownerEmail
    ownerName
    initialValue
    expirationDate
    isReloadable
    caption
    status
    lastTransactionDate
    totalCredited
    totalDebited
    transactionCount
    transactions {
      id
      operation
      value
      balanceAfter
      description
      orderId
      orderNumber
      createdAt
      createdBy
      source
    }
    orderIds
  }
}
```

**Variáveis (por userId):**
```json
{
  "userId": "user-123"
}
```

**Variáveis (por cpf):**
```json
{
  "cpf": "12345678900"
}
```

**Resposta:**
```json
{
  "data": {
    "vouchersByUser": [
      {
        "id": "12345",
        "nativeId": "native-123",
        "code": "ABCD1234EFGH",
        "currentBalance": 150.50,
        "authorEmail": "admin@example.com",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "ownerCpf": "12345678900",
        "ownerEmail": "joao@example.com",
        "ownerName": "João Silva",
        "initialValue": 200.00,
        "expirationDate": "2025-01-15",
        "isReloadable": true,
        "caption": "Gift Card Promocional",
        "status": "active",
        "lastTransactionDate": "2024-02-10T14:20:00.000Z",
        "totalCredited": 250.00,
        "totalDebited": 99.50,
        "transactionCount": 5,
        "transactions": [
          {
            "id": "tx-001",
            "operation": "Credit",
            "value": 200.00,
            "balanceAfter": 200.00,
            "description": "Initial credit - 200",
            "orderId": null,
            "orderNumber": null,
            "createdAt": "2024-01-15T10:30:00.000Z",
            "createdBy": "admin@example.com",
            "source": "manual"
          }
        ],
        "orderIds": ["vtex-order-123"]
      }
    ]
  }
}
```

**Notas:**
- Forneça **apenas um** dos parâmetros: `userId` **ou** `cpf`
- Se fornecer `userId`, o sistema busca o CPF correspondente no MasterData CL
- Retorna todos os gift cards associados ao CPF encontrado
- Inclui histórico completo de transações para cada gift card

---

### Mutations

#### 1. Criar Gift Card

Cria um novo gift card com valor inicial e associa a um cliente.

**GraphQL Mutation:**
```graphql
mutation CreateVoucher($input: CreateVoucherInput!) {
  createVoucher(input: $input) {
    id
    nativeId
    code
    currentBalance
    authorEmail
    ownerCpf
    initialValue
    expirationDate
    isReloadable
    status
  }
}
```

**Variáveis:**
```json
{
  "input": {
    "initialValue": 200.00,
    "expirationDate": "2025-12-31",
    "ownerCpf": "12345678900",
    "caption": "Gift Card Promocional",
    "relationName": "loyalty-program",
    "isReloadable": true,
    "multipleRedemptions": true,
    "currencyCode": "BRL"
  }
}
```

**Campos do Input:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `initialValue` | Float | Valor inicial do gift card | Sim |
| `expirationDate` | String | Data de expiração (YYYY-MM-DD) | Sim |
| `ownerCpf` | String | CPF do proprietário (apenas números) | Sim |
| `caption` | String | Legenda/descrição do gift card | Não |
| `relationName` | String | Nome da relação (ex: "loyalty-program", "promotion", "refund") | Sim |
| `isReloadable` | Boolean | Se o gift card pode ser recarregado | Não (padrão: false) |
| `multipleRedemptions` | Boolean | Se permite múltiplas utilizações | Não (padrão: true) |
| `currencyCode` | String | Código da moeda | Não (padrão: "BRL") |

**Resposta:**
```json
{
  "data": {
    "createVoucher": {
      "id": "native-123",
      "nativeId": "native-123",
      "code": "ABCD1234EFGH",
      "currentBalance": 200.00,
      "authorEmail": "admin@example.com",
      "ownerCpf": "12345678900",
      "initialValue": 200.00,
      "expirationDate": "2025-12-31",
      "isReloadable": true,
      "status": "active"
    }
  }
}
```

---

#### 2. Ajustar Saldo do Gift Card

Adiciona ou remove saldo de um gift card existente.

**GraphQL Mutation:**
```graphql
mutation AdjustBalance($input: AdjustBalanceInput!) {
  adjustVoucherBalance(input: $input) {
    id
    nativeId
    code
    currentBalance
    status
    transactions {
      id
      operation
      value
      balanceAfter
      description
      createdAt
    }
  }
}
```

**Variáveis:**
```json
{
  "input": {
    "nativeId": "native-123",
    "value": 50.00,
    "description": "Crédito promocional"
  }
}
```

**Nota:** Para adicionar saldo, use valor positivo. Para remover saldo, use valor negativo.

**Resposta:**
```json
{
  "data": {
    "adjustVoucherBalance": {
      "id": "12345",
      "nativeId": "native-123",
      "code": "ABCD1234EFGH",
      "currentBalance": 250.00,
      "status": "active",
      "transactions": [ ... ]
    }
  }
}
```

---

#### 3. Sincronizar Histórico do Gift Card

Sincroniza o histórico de transações do gift card com a API nativa da VTEX.

**GraphQL Mutation:**
```graphql
mutation SyncHistory($nativeId: String!) {
  syncVoucherHistory(nativeId: $nativeId) {
    success
    transactionsSynced
    totalTransactions
  }
}
```

**Variáveis:**
```json
{
  "nativeId": "native-123"
}
```

**Resposta:**
```json
{
  "data": {
    "syncVoucherHistory": {
      "success": true,
      "transactionsSynced": 3,
      "totalTransactions": 8
    }
  }
}
```

---

#### 4. Deletar Gift Card

Remove um gift card do sistema (apenas do MasterData, não da API nativa da VTEX).

**GraphQL Mutation:**
```graphql
mutation DeleteVoucher($nativeId: String!) {
  deleteVoucher(nativeId: $nativeId)
}
```

**Variáveis:**
```json
{
  "nativeId": "native-123"
}
```

**Resposta:**
```json
{
  "data": {
    "deleteVoucher": true
  }
}
```

---

## REST API

### Queries REST

#### 1. Listar Todos os Gift Cards

**GET** `/_v/giftcard/query/vouchers`

**POST** `/_v/giftcard/query/vouchers`

**Request Body (POST)** - Opcional:
```json
{}
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "12345",
      "nativeId": "native-123",
      "code": "ABCD****EFGH",
      "currentBalance": 150.50,
      "authorEmail": "admin@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "ownerCpf": "12345678900",
      "ownerName": "João Silva",
      "initialValue": 200.00,
      "expirationDate": "2025-01-15",
      "isReloadable": true,
      "status": "active",
      "totalCredited": 250.00,
      "totalDebited": 99.50,
      "transactionCount": 5
    }
  ]
}
```

---

#### 2. Buscar Gift Card por ID

**GET** `/_v/giftcard/query/voucher?id={id}`

**POST** `/_v/giftcard/query/voucher`

**Query Parameters (GET):**
- `id` (string, obrigatório): ID ou nativeId do gift card

**Request Body (POST):**
```json
{
  "id": "native-123"
}
```

**Resposta:**
```json
{
  "data": {
    "id": "12345",
    "nativeId": "native-123",
    "code": "ABCD1234EFGH",
    "currentBalance": 150.50,
    "authorEmail": "admin@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "ownerCpf": "12345678900",
    "ownerEmail": "joao@example.com",
    "ownerName": "João Silva",
    "initialValue": 200.00,
    "expirationDate": "2025-01-15",
    "isReloadable": true,
    "caption": "Gift Card Promocional",
    "status": "active",
    "lastTransactionDate": "2024-02-10T14:20:00.000Z",
    "totalCredited": 250.00,
    "totalDebited": 99.50,
    "transactionCount": 5,
    "transactions": [ ... ],
    "orderIds": ["vtex-order-123"]
  }
}
```

---

#### 3. Buscar Cliente por CPF

**GET** `/_v/giftcard/query/searchClientByCpf?cpf={cpf}`

**POST** `/_v/giftcard/query/searchClientByCpf`

**Query Parameters (GET):**
- `cpf` (string, obrigatório): CPF do cliente (apenas números)

**Request Body (POST):**
```json
{
  "cpf": "12345678900"
}
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "client-123",
      "document": "12345678900",
      "firstName": "João",
      "lastName": "Silva",
      "email": "joao@example.com"
    }
  ]
}
```

---

#### 4. Buscar Gift Cards por Usuário (userId ou CPF)

Retorna todos os gift cards de um usuário específico. Pode buscar por `userId` ou `cpf`.

**GET** `/_v/giftcard/query/vouchersByUser?userId={userId}`

**GET** `/_v/giftcard/query/vouchersByUser?cpf={cpf}`

**POST** `/_v/giftcard/query/vouchersByUser`

**Query Parameters (GET):**
- `userId` (string, opcional): ID do usuário no MasterData CL
- `cpf` (string, opcional): CPF do cliente (apenas números)

**Nota:** Forneça **apenas um** dos parâmetros: `userId` **ou** `cpf`

**Request Body (POST) - por userId:**
```json
{
  "userId": "user-123"
}
```

**Request Body (POST) - por cpf:**
```json
{
  "cpf": "12345678900"
}
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "12345",
      "nativeId": "native-123",
      "code": "ABCD1234EFGH",
      "currentBalance": 150.50,
      "authorEmail": "admin@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "ownerCpf": "12345678900",
      "ownerEmail": "joao@example.com",
      "ownerName": "João Silva",
      "initialValue": 200.00,
      "expirationDate": "2025-01-15",
      "isReloadable": true,
      "caption": "Gift Card Promocional",
      "status": "active",
      "lastTransactionDate": "2024-02-10T14:20:00.000Z",
      "totalCredited": 250.00,
      "totalDebited": 99.50,
      "transactionCount": 5,
      "transactions": [ ... ],
      "orderIds": ["vtex-order-123"]
    }
  ]
}
```

**Notas:**
- Se fornecer `userId`, o sistema busca o CPF correspondente no MasterData CL automaticamente
- Retorna todos os gift cards associados ao CPF encontrado
- Inclui histórico completo de transações para cada gift card
- Ideal para uso no My Account, onde você tem o `userId` do usuário logado

---

### Mutations REST

#### 1. Criar Gift Card

**POST** `/_v/giftcard/mutation/createVoucher`

**Request Body:**
```json
{
  "input": {
    "initialValue": 200.00,
    "expirationDate": "2025-12-31",
    "ownerCpf": "12345678900",
    "caption": "Gift Card Promocional",
    "relationName": "loyalty-program",
    "isReloadable": true,
    "multipleRedemptions": true,
    "currencyCode": "BRL"
  }
}
```

**Resposta:**
```json
{
  "data": {
    "id": "native-123",
    "nativeId": "native-123",
    "code": "ABCD1234EFGH",
    "currentBalance": 200.00,
    "authorEmail": "admin@example.com",
    "ownerCpf": "12345678900",
    "initialValue": 200.00,
    "expirationDate": "2025-12-31",
    "isReloadable": true,
    "status": "active"
  }
}
```

---

#### 2. Ajustar Saldo do Gift Card

**POST** `/_v/giftcard/mutation/adjustVoucherBalance`

**Request Body:**
```json
{
  "input": {
    "nativeId": "native-123",
    "value": 50.00,
    "description": "Crédito promocional"
  }
}
```

**Nota:** Use valor positivo para crédito, negativo para débito.

**Resposta:**
Retorna o objeto completo do gift card atualizado (mesmo formato da query `voucher`).

---

#### 3. Sincronizar Histórico do Gift Card

**POST** `/_v/giftcard/mutation/syncVoucherHistory`

**Request Body:**
```json
{
  "nativeId": "native-123"
}
```

**Resposta:**
```json
{
  "data": {
    "success": true,
    "transactionsSynced": 3,
    "totalTransactions": 8
  }
}
```

---

#### 4. Deletar Gift Card

**POST** `/_v/giftcard/mutation/deleteVoucher`

**Request Body:**
```json
{
  "nativeId": "native-123"
}
```

**Resposta:**
```json
{
  "data": true
}
```

---

## Exemplos de Uso

### Exemplo 1: Criar Gift Card (GraphQL)

```graphql
mutation {
  createVoucher(input: {
    initialValue: 100.00
    expirationDate: "2025-12-31"
    ownerCpf: "12345678900"
    relationName: "loyalty-program"
    isReloadable: true
  }) {
    id
    code
    currentBalance
  }
}
```

### Exemplo 2: Criar Gift Card (REST)

```bash
curl -X POST https://{account}.myvtex.com/_v/giftcard/mutation/createVoucher \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "initialValue": 100.00,
      "expirationDate": "2025-12-31",
      "ownerCpf": "12345678900",
      "relationName": "loyalty-program",
      "isReloadable": true
    }
  }'
```

### Exemplo 3: Buscar Gift Card (GraphQL)

```graphql
query {
  voucher(id: "native-123") {
    id
    code
    currentBalance
    transactions {
      operation
      value
      description
      createdAt
    }
  }
}
```

### Exemplo 4: Buscar Gift Card (REST)

```bash
curl -X GET "https://{account}.myvtex.com/_v/giftcard/query/voucher?id=native-123"
```

### Exemplo 5: Adicionar Saldo (GraphQL)

```graphql
mutation {
  adjustVoucherBalance(input: {
    nativeId: "native-123"
    value: 50.00
    description: "Bônus de fidelidade"
  }) {
    currentBalance
    status
  }
}
```

### Exemplo 6: Adicionar Saldo (REST)

```bash
curl -X POST https://{account}.myvtex.com/_v/giftcard/mutation/adjustVoucherBalance \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "nativeId": "native-123",
      "value": 50.00,
      "description": "Bônus de fidelidade"
    }
  }'
```

---

## Integração com My Account e Checkout

### My Account

Para exibir os gift cards do cliente no My Account:

**GraphQL (Recomendado):**
```graphql
query GetUserVouchers($userId: String!) {
  vouchersByUser(userId: $userId) {
    id
    code
    currentBalance
    expirationDate
    status
    transactions {
      operation
      value
      description
      createdAt
    }
  }
}
```

**Variáveis:**
```json
{
  "userId": "user-123"
}
```

**REST (Recomendado):**
```
GET /_v/giftcard/query/vouchersByUser?userId={userId}
```

**Alternativa (por CPF):**
```graphql
query GetUserVouchersByCpf($cpf: String!) {
  vouchersByUser(cpf: $cpf) {
    id
    code
    currentBalance
    expirationDate
    status
  }
}
```

**REST (Alternativa):**
```
GET /_v/giftcard/query/vouchersByUser?cpf={cpf}
```

**Exibir Detalhes:**
```graphql
query GetVoucherDetails($id: ID!) {
  voucher(id: $id) {
    id
    code
    currentBalance
    expirationDate
    status
    transactions {
      operation
      value
      description
      createdAt
    }
  }
}
```

### Checkout

Para utilizar gift cards no checkout:

**1. Validar Gift Card (GraphQL):**
```graphql
query ValidateVoucher($id: ID!) {
  voucher(id: $id) {
    id
    code
    currentBalance
    status
    expirationDate
  }
}
```

**2. Validar Gift Card (REST):**
```
GET /_v/giftcard/query/voucher?id={code}
```
Verificar se `status === "active"` e `currentBalance > 0`.

**3. Aplicar Gift Card:**
O débito do gift card é feito automaticamente pela VTEX quando o pedido é processado. A transação aparecerá no histórico após a sincronização.

---

## Notas Importantes

1. **Formato de Data**: Todas as datas devem estar no formato `YYYY-MM-DD` (ISO 8601 para datas).

2. **CPF**: O CPF deve ser enviado apenas com números, sem pontos ou traços.

3. **Valores Monetários**: Os valores devem ser enviados como números (não strings), usando ponto como separador decimal (ex: `100.50`).

4. **Status do Gift Card**: Os status possíveis são:
   - `active`: Gift card ativo e com saldo disponível
   - `expired`: Gift card expirado
   - `used`: Gift card totalmente utilizado
   - `error`: Erro ao buscar informações do gift card

5. **Código do Gift Card**: Na listagem (`vouchers`), o código é mascarado por segurança. Para obter o código completo, use a query `voucher` com o ID específico.

6. **Sincronização**: A sincronização de histórico busca transações da API nativa da VTEX e as mescla com as transações já armazenadas no MasterData, evitando duplicatas.

7. **Deleção**: A deleção remove apenas o registro do MasterData. O gift card continua existindo na API nativa da VTEX e pode ser recuperado através da sincronização.

8. **Escolha entre GraphQL e REST**: 
   - Use **GraphQL** quando precisar de queries flexíveis e seleção de campos específicos
   - Use **REST** quando precisar de integração simples via HTTP ou quando trabalhar com ferramentas que não suportam GraphQL

---

## Suporte

Para dúvidas ou problemas, consulte a documentação do serviço ou entre em contato com a equipe de desenvolvimento.
