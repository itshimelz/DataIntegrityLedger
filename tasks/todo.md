# Academic Integrity Ledger (AILedger) — Todo List

## Phase 1: Foundation [COMPLETED]
- [x] **Task 1: Domain Types and Prisma Schema** (`lib/types.ts`, `prisma/schema.prisma`)
- [x] **Task 2: Cryptographic Foundation via `node:crypto`** (`lib/crypto/canonical.ts`, `lib/crypto/hash.ts`, `lib/crypto/signature.ts`, `lib/crypto/keys.ts`)
- [x] **Task 3: Unit Tests** (`tests/crypto/crypto.test.ts`, `tests/ledger/store.test.ts` — 17 passing tests)
- [x] **Task 4: Demo Data & In-Memory Store** (`lib/demo/data.ts`, `lib/demo/store.ts`)

---

## Phase 6: UI & Visual Experience [COMPLETED]
- [x] **Task 5: Layout Shell & Navigation** (`components/layout/sidebar.tsx`, `components/layout/topbar.tsx`, `components/layout/shell.tsx`)
- [x] **Task 6: Dashboard & Chain Health Widget** (`components/dashboard/stat-cards.tsx`, `components/dashboard/chain-health-widget.tsx`, `components/dashboard/demo-controls.tsx`, `components/dashboard/recent-records.tsx`)
- [x] **Task 7: Grade Records Table & Crypto Inspector Modal** (`components/records/grade-table.tsx`, `components/records/crypto-modal.tsx`, `components/records/add-grade-modal.tsx`, `components/records/tamper-modal.tsx`)
- [x] **Task 8: Integrity Verification Panel & Tamper Alert** (`components/verification/verification-panel.tsx`, `components/verification/verification-checklist.tsx`, `components/verification/tamper-alert.tsx`)
- [x] **Task 9: API Route Handlers** (`app/api/grades`, `app/api/verification`, `app/api/demo/tamper`, `app/api/demo/reset`)
- [x] **Task 10: App Pages** (`app/page.tsx`, `app/records/page.tsx`, `app/verify/page.tsx`)

---

### Checkpoint Verification
- [x] `bun test`: 17 passed (0 failures)
- [x] `bun run lint`: 0 errors, 0 warnings (Oxlint)
- [x] `bun run typecheck`: 0 errors (TypeScript 5 strict mode)
- [x] `bun run build`: Next.js 16 build succeeded
