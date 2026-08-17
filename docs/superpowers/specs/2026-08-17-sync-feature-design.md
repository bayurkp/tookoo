# Feature Design: WebRTC P2P Sync & Store Pairing (`src/features/sync`)

## 1. Overview

Tookoo is a serverless, local-first POS that coordinates between multiple cashier and manager devices in the same store without requiring a central database server or active internet connection. Store pairing is accomplished via QR Code exchange or a 12-word BIP-39 mnemonic passphrase. Synchronizations apply the Last-Write-Wins (LWW) conflict resolution algorithm to local Dexie IndexedDB.

---

## 2. P2P Protocol & Conflict Resolution

### 2.1 Pairing Payload

A pairing QR Code contains JSON or URL-safe base64:

```json
{
  "storeId": "uuid-v4",
  "storeName": "Tookoo Coffee & Bakery",
  "passphrase": "ocean forest crystal guitar...",
  "timestamp": 1723891200000
}
```

### 2.2 Last-Write-Wins (LWW) Ingestion

When a peer broadcasts a `SyncMessage`:

1. Check if entity with `data.id` exists in local Dexie table (`products` or `orders`).
2. If entity does not exist or `msg.updatedAt > localEntity.updatedAt`, write to Dexie: `table.put(msg.data)`.
3. Invalidate TanStack Query cache: `queryClient.invalidateQueries({ queryKey: [msg.collection] })`.

### 2.3 Data Backup & Export

- Allow full JSON backup export (`tookoo-backup-YYYY-MM-DD.json`) of products, orders, and store settings.
- Allow restoring or merging JSON backup files directly into local Dexie.

---

## 3. Modular Architecture

```text
src/
├── features/
│   └── sync/
│       ├── api/
│       │   ├── get-settings.ts
│       │   ├── update-settings.ts
│       │   └── sync-engine.ts
│       ├── components/
│       │   ├── store-identity-card.tsx
│       │   ├── qr-pairing-card.tsx
│       │   ├── qr-scanner-modal.tsx
│       │   ├── connected-peers-card.tsx
│       │   └── backup-export-card.tsx
│       ├── hooks/
│       │   └── use-p2p-sync.ts
│       └── types/
│           └── sync.types.ts
│
└── app/
    └── pages/
        ├── sync-page.tsx
        └── __tests__/
            └── sync-page.test.tsx
```
