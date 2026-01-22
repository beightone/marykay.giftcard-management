# Gift Card Management - Documentação

Esta pasta contém toda a documentação do serviço de gerenciamento de gift cards (vouchers).

## 📚 Documentação Disponível

### [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
**Documentação completa da API** - Inclui tanto GraphQL quanto REST API com exemplos detalhados, formatos de request/response, e guias de integração.

### [REST_API.md](./REST_API.md)
**Documentação detalhada da API REST** - Versão focada apenas na API REST (mantida para referência).

### [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)
**Guia de uso do Postman** - Instruções completas para importar e usar a collection do Postman para testar a API.

### Arquivos do Postman

- **[GiftCard_API.postman_collection.json](./GiftCard_API.postman_collection.json)** - Collection completa com todos os endpoints
- **[GiftCard_API.postman_environment.json](./GiftCard_API.postman_environment.json)** - Environment com variáveis pré-configuradas

## 🚀 Início Rápido

1. **Leia a documentação completa**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. **Importe a collection do Postman** para testar os endpoints
3. **Siga os exemplos** de integração para My Account e Checkout

## 📖 Estrutura da API

A API oferece duas formas de acesso:

### GraphQL API
- Endpoint: `/_v/private/vtex.giftcard-manager@0.0.12/graphiql/v1`
- Ideal para: Queries flexíveis, seleção de campos específicos
- Documentação: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#graphql-api)

### REST API
- Endpoint: `/_v/giftcard`
- Ideal para: Integração simples via HTTP, ferramentas que não suportam GraphQL
- Documentação: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#rest-api)

## 🔧 Operações Disponíveis

### Queries (Consultas)
- `vouchers` - Listar todos os gift cards
- `voucher` - Buscar gift card por ID
- `searchClientByCpf` - Buscar cliente por CPF

### Mutations (Alterações)
- `createVoucher` - Criar gift card
- `adjustVoucherBalance` - Ajustar saldo (adicionar/remover)
- `syncVoucherHistory` - Sincronizar histórico de transações
- `deleteVoucher` - Deletar gift card

## 📝 Notas Importantes

- Todas as APIs são públicas (autenticação gerenciada pela VTEX IO)
- CPF deve ser enviado apenas com números (sem pontos ou traços)
- Datas no formato `YYYY-MM-DD`
- Valores monetários com ponto como separador decimal (ex: `100.50`)

## 🆘 Suporte

Para dúvidas ou problemas, consulte a documentação completa ou entre em contato com a equipe de desenvolvimento.
