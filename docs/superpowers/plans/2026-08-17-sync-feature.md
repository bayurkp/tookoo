# WebRTC P2P Sync & Store Pairing Implementation Plan

Implement the P2P Sync & Store Pairing module (`src/features/sync`) enabling multi-device synchronization via WebRTC DataChannel, QR code pairing, 12-word BIP-39 passphrase recovery, LWW conflict resolution, and local JSON backup export/import.

---

### Proposed Changes

#### Shared Libs & Types

- [MODIFY] `src/types/sync.types.ts`
- [NEW] `src/lib/webrtc.ts`

#### Sync Feature Layer (`src/features/sync`)

- [NEW] `src/features/sync/api/store-settings-api.ts`
- [NEW] `src/features/sync/api/sync-engine.ts`
- [NEW] `src/features/sync/api/__tests__/sync-engine.test.ts`
- [NEW] `src/features/sync/hooks/use-p2p-sync.ts`
- [NEW] `src/features/sync/hooks/__tests__/use-p2p-sync.test.tsx`
- [NEW] `src/features/sync/components/store-identity-card.tsx`
- [NEW] `src/features/sync/components/qr-pairing-card.tsx`
- [NEW] `src/features/sync/components/qr-scanner-modal.tsx`
- [NEW] `src/features/sync/components/connected-peers-card.tsx`
- [NEW] `src/features/sync/components/backup-export-card.tsx`
- [NEW] `src/features/sync/components/__tests__/store-identity-card.test.tsx`
- [NEW] `src/features/sync/components/__tests__/backup-export-card.test.tsx`

#### Application Pages Layer (`src/app/pages`)

- [MODIFY] `src/app/pages/sync-page.tsx`
- [NEW] `src/app/pages/__tests__/sync-page.test.tsx`

---

## Tasks

### Task 1: Sync Types, Settings API & LWW Ingestion Engine

- Update `src/types/sync.types.ts`.
- Implement `store-settings-api.ts` to initialize or retrieve store settings from Dexie.
- Implement `sync-engine.ts` handling LWW message application (`table.put`).
- Write unit tests.

### Task 2: WebRTC P2P Engine & `useP2pSync` Hook

- Implement `src/lib/webrtc.ts` client wrapper.
- Implement `useP2pSync()` hook managing local store initialization, connected peer list, manual sync, and backup export/import.
- Write unit tests.

### Task 3: Pairing & Backup UI Components

- Implement `StoreIdentityCard`, `QrPairingCard`, `QrScannerModal`, `ConnectedPeersCard`, and `BackupExportCard`.
- Write component unit tests.

### Task 4: Sync Page Composition & Integration

- Update `src/app/pages/sync-page.tsx` with responsive layout and tabbed sections.
- Write integration tests in `src/app/pages/__tests__/sync-page.test.tsx`.

### Task 5: Full Quality Verification

- Run Prettier, Oxlint, Vitest, and Vite build verification.
