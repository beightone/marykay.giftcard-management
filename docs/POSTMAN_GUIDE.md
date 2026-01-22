# Guia de Uso - Postman Collection

Este guia explica como importar e usar a collection do Postman para testar a API REST de Gift Card Management.

## Arquivos Disponíveis

1. **GiftCard_API.postman_collection.json** - Collection completa com todos os endpoints
2. **GiftCard_API.postman_environment.json** - Environment com variáveis pré-configuradas

## Como Importar

### 1. Importar a Collection

1. Abra o Postman
2. Clique em **Import** (canto superior esquerdo)
3. Selecione o arquivo `GiftCard_API.postman_collection.json`
4. Clique em **Import**

### 2. Importar o Environment

1. No Postman, clique no ícone de **engrenagem** (⚙️) no canto superior direito
2. Clique em **Import**
3. Selecione o arquivo `GiftCard_API.postman_environment.json`
4. Clique em **Import**
5. Selecione o environment "Gift Card API - Environment" no dropdown no canto superior direito

## Configurar Variáveis

Antes de usar, configure as variáveis do environment:

1. Clique no ícone de **olho** (👁️) no canto superior direito
2. Edite as variáveis:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `baseUrl` | URL base da sua conta VTEX | `https://marykay.vtexcommercestable.com.br` |
| `clientCpf` | CPF do cliente para testes (apenas números) | `12345678900` |
| `voucherId` | ID do gift card para testes (será preenchido automaticamente após criar) | Deixe vazio inicialmente |
| `voucherCode` | Código do gift card | Deixe vazio inicialmente |
| `authorEmail` | Email do autor | `admin@marykay.com` |

## Estrutura da Collection

A collection está organizada em 3 pastas principais:

### 📁 Queries

Endpoints para consultas (GET/POST):

- Listar Todos os Gift Cards
- Buscar Gift Card por ID
- Buscar Cliente por CPF

### 📁 Mutations

Endpoints para alterações (POST):

- Criar Gift Card
- Adicionar Saldo ao Gift Card
- Remover Saldo do Gift Card
- Sincronizar Histórico do Gift Card
- Deletar Gift Card

### 📁 Fluxos Completos

Fluxos pré-configurados para testar cenários completos:

- **Fluxo 1**: Criar e Verificar Gift Card
- **Fluxo 2**: Adicionar Saldo e Verificar
- **Fluxo 3**: Sincronizar Histórico

## Como Usar

### Teste Rápido - Criar um Gift Card

1. Configure o `baseUrl` e `clientCpf` no environment
2. Vá em **Mutations** → **Criar Gift Card**
3. Ajuste o body se necessário (valores, datas, etc.)
4. Clique em **Send**
5. Copie o `nativeId` da resposta e cole na variável `voucherId` do environment

### Teste Rápido - Listar Gift Cards

1. Vá em **Queries** → **Listar Todos os Gift Cards**
2. Clique em **Send**
3. Veja a lista de todos os gift cards cadastrados

### Usar um Fluxo Completo

1. Vá em **Fluxos Completos** → **Fluxo 1: Criar e Verificar Gift Card**
2. Execute cada request na ordem (1, 2, 3)
3. O Postman executará automaticamente os passos sequenciais

## Dicas Importantes

### ⚠️ CPF Obrigatório

- O CPF deve existir no MasterData da VTEX (entidade CL)
- Use apenas números, sem pontos ou traços
- Exemplo: `12345678900` (não `123.456.789-00`)

### ⚠️ Formato de Data

- Use formato `YYYY-MM-DD`
- Exemplo: `2025-12-31` (não `31/12/2025`)

### ⚠️ Valores Monetários

- Use ponto como separador decimal
- Exemplo: `100.50` (não `100,50`)

### ⚠️ Variáveis Automáticas

Após criar um gift card, copie o `nativeId` da resposta e atualize a variável `voucherId` no environment para usar nos próximos testes.

## Exemplo de Fluxo Completo

### Passo 1: Buscar Cliente

```
GET /_v/giftcard/query/searchClientByCpf?cpf=12345678900
```

### Passo 2: Criar Gift Card

```json
POST /_v/giftcard/mutation/createVoucher
{
  "input": {
    "initialValue": 100.00,
    "expirationDate": "2025-12-31",
    "ownerCpf": "12345678900",
    "relationName": "loyalty-program",
    "isReloadable": true
  }
}
```

### Passo 3: Verificar Gift Card Criado

```
GET /_v/giftcard/query/voucher?id={nativeId da resposta anterior}
```

### Passo 4: Adicionar Saldo

```json
POST /_v/giftcard/mutation/adjustVoucherBalance
{
  "input": {
    "nativeId": "{nativeId}",
    "value": 50.00,
    "description": "Bônus de fidelidade"
  }
}
```

### Passo 5: Verificar Saldo Atualizado

```
GET /_v/giftcard/query/voucher?id={nativeId}
```

## Troubleshooting

### Erro 404: "Query/Mutation not found"

- Verifique se o nome da operação está correto
- Verifique se a rota está correta: `/giftcard/query/` ou `/giftcard/mutation/`

### Erro 400: "Profile not found for CPF"

- O CPF não existe no MasterData CL
- Crie o cliente primeiro na VTEX ou use um CPF existente

### Erro 500: "Unexpected error"

- Verifique os logs do serviço
- Verifique se todas as dependências estão configuradas corretamente
- Verifique se o `baseUrl` está correto

### Resposta vazia ou erro de conexão

- Verifique se o `baseUrl` está correto
- Verifique se o serviço está rodando
- Verifique a conexão com a internet

## Próximos Passos

Após testar todos os endpoints, você pode:

1. **Criar testes automatizados** usando os scripts do Postman
2. **Criar novos fluxos** combinando diferentes endpoints
3. **Exportar exemplos** para documentação
4. **Compartilhar a collection** com a equipe

---

**Boa sorte com os testes! 🚀**
