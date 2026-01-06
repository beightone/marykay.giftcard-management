# Project Specification: Advanced GiftCard Admin (VTEX IO)

## 1. Project Context & Architecture

We are building a VTEX IO App (Admin) to manage GiftCards. The native VTEX GiftCard API lacks traceability (who created it) and searchability (search by CPF).
**Architecture Pattern:** "Shadow Record" / Dual-Write.

- **Source of Truth (Finance):** Native VTEX GiftCard API (via JanusClient).
- **Source of Truth (Metadata):** MasterData V2 (Entity: `GC`).
- **Middleware:** Node.js (BFF) orchestrates the dual-write to ensure both systems are synced.

## 2. Tech Stack

- **Backend:** Node.js, GraphQL (`@vtex/api`), Custom Clients.
- **Frontend:** React, VTEX Styleguide, GraphQL Queries.
- **Database:** VTEX MasterData V2.

## 3. File Structure & Implementation Plan

### Phase 1: Configuration

**File:** `manifest.json`

- Builders: `node`, `react`, `admin`, `graphql`, `messages`.
- Name: `vendor.giftcard-manager`.

**File:** `policies.json`

- Must allow access to:
  - `vrn:vtex.giftcard-api:*:*:*`
  - `vrn:vtex.masterdata-v2:*:*:dataentities/GC/*`
  - `vrn:vtex.masterdata-v2:*:*:dataentities/CL/*` (To resolve Client Profile IDs).

### Phase 2: Backend (Node.js)

**File:** `node/clients/giftCardNative.ts`

- Extend `JanusClient`.
- **Crucial:** API calls must contain the header `VtexIdclientAutCookie`. Use `this.context.adminUserAuthToken` if available, or `this.context.authToken`.
- Methods required:
  - `createCard(payload)`: POST `/api/giftcards`
  - `createTransaction(id, payload)`: POST `/api/giftcards/{id}/transactions` (For initial credit).
  - `getCard(id)`: GET `/api/giftcards/{id}`

**File:** `node/resolvers/createVoucher.ts` (GraphQL Mutation)

- **Logic Flow:**
  1. Extract `adminUserAuthToken` from context to decode the **Author's Email** (JWT).
  2. If `cpf` is provided, search MasterData CL to get the `profileId` (Native API requires profileId for restriction).
  3. Call `giftCardNative.createCard`.
  4. Call `giftCardNative.createTransaction` (Operation: Credit) because cards start with 0 balance.
  5. Call MasterData V2 `createDocument` (Entity `GC`) to save: `nativeId`, `authorEmail`, `ownerCpf`, `initialValue`, `expirationDate`.
- **Error Handling:** If Native succeeds but MasterData fails, log a critical error.

**File:** `graphql/schema.graphql`

- Define `type Voucher` combining native fields (currentBalance) and metadata (authorEmail).
- Define `input CreateVoucherInput`.

### Phase 3: Frontend (React/Admin)

**File:** `react/pages/AdminList.tsx`

- Use `<Table />` from `vtex.styleguide`.
- **Data Source:** Fetch from **MasterData V2** (GraphQL), NOT the native API.
- Columns: Code (masked), Author, Client (CPF), Status, Expiration.

**File:** `react/pages/AdminCreate.tsx`

- Form using `vtex.styleguide` components (`Input`, `DatePicker`, `Toggle`).
- **Client Search:** An autocomplete field that searches the `CL` entity.
- On submit: Call the `createVoucher` GraphQL mutation.

**File:** `react/pages/AdminDetails.tsx`

- Route: `/admin/app/vouchers/:id`.
- **Data Fetching:** Perform a "Merge Query". Get metadata from MDv2 + Real-time Balance from Native API.
- Display transaction history parsing the `description` field to find Order IDs.

## 4. MasterData V2 Schema (Reference)

Entity: `GC`

```json
{
  "properties": {
    "nativeId": { "type": "string" },
    "authorEmail": { "type": "string", "format": "email" },
    "ownerCpf": { "type": "string" },
    "initialValue": { "type": "number" },
    "isReloadable": { "type": "boolean" }
  },
  "v-indexed": ["nativeId", "authorEmail", "ownerCpf"]
}
