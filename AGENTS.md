<!-- BEGIN:nextjs-agent-rules -->
# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.
<!-- END:nextjs-agent-rules -->

# Academic Integrity Ledger (AILedger)

## Project Overview

**Academic Integrity Ledger (AILedger)** is a tamper-evident academic grade management system built with Next.js 16 App Router, TypeScript, and Tailwind CSS. The core security principle is:

> **Tampering may not be preventable, but unauthorized modification must become detectable and provable.**

Every grade record is protected using SHA-256 cryptographic content hashing, sequential hash chaining (`prev_hash` → `record_hash`), and RSA-2048 digital signatures via `node:crypto`.

Key reference documents:
- [`PRODUCT.md`](file:///home/itshimelz/Projects/AILedger/PRODUCT.md) — Product vision, constraints, and commitments.
- [`Academic_Integrity_Ledger_SRS.md`](file:///home/itshimelz/Projects/AILedger/Academic_Integrity_Ledger_SRS.md) — Complete Software Requirements Specification.

---

## Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Runtime & Package Manager**: **Bun** (Always use `bun`, `bun add`, `bun run` — never npm, yarn, or pnpm)
- **Language**: TypeScript 5 (Strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (`base-sera` style, `@base-ui/react`, `@phosphor-icons/react`)
- **Database & ORM**: PostgreSQL (Supabase) with Prisma ORM
- **Authentication**: Supabase Auth (Roles: `FACULTY`, `REGISTRAR`, `ADMIN`)
- **Cryptography**: Node.js standard `node:crypto` (SHA-256 hashing, RSA-2048 sign/verify; no custom or hand-rolled crypto)
- **Linting & Formatting**: **Oxlint** (`bun run lint`) and **Prettier** (`bun run format`)
- **Deployment Target**: Cloudflare Workers (free tier) with Supabase persistence

---

## Development Commands

All commands MUST be run using `bun`:

```bash
# Start development server with Turbopack
bun dev

# Run fast linting via oxlint
bun run lint

# Run TypeScript typecheck
bun run typecheck

# Format code with Prettier
bun run format

# Build production bundle
bun run build

# Start production server
bun run start
```

---

## Project Structure

```text
AILedger/
├── app/                      # Next.js App Router
│   ├── (auth)/login/         # Faculty/Admin login page
│   ├── dashboard/            # Overview & ledger health dashboard
│   ├── records/              # Grade records browser & crypto inspector
│   ├── verify/               # Full ledger verification runner & report
│   ├── api/                  # Route handlers (auth, grades, verification, demo)
│   ├── layout.tsx            # Root layout (Theme provider, metadata)
│   ├── page.tsx              # Landing / entry redirect
│   └── globals.css           # Tailwind CSS theme & custom styling
├── components/
│   ├── ui/                   # shadcn/ui base primitives (Base UI, Phosphor)
│   ├── layout/               # Sidebar, Topbar, PageHeader navigation
│   ├── dashboard/            # Stat cards, chain health widgets, activity feeds
│   ├── records/              # Grade tables, audit log viewer, crypto modal
│   └── verification/         # Verification checklist, status badges, tamper alert
├── lib/
│   ├── crypto/               # SHA-256 canonical hashing, RSA-2048 signing/verification
│   ├── ledger/               # Ledger record creation, append-only chaining, ledger validator
│   ├── auth/                 # Session management & role-based authorization
│   ├── db/                   # Prisma database client
│   └── utils.ts              # Styling helpers (clsx, twMerge)
├── hooks/                    # Reusable React hooks
├── Academic_Integrity_Ledger_SRS.md # Binding functional/non-functional spec
└── PRODUCT.md                # Product requirements & design principles
```

---

## Critical Engineering Guidelines for Agents

### 1. Package Manager & Script Runner
- **ALWAYS** use `bun` (`bun install`, `bun add`, `bun add -d`, `bun run <script>`).
- **NEVER** run `npm`, `npx`, `yarn`, or `pnpm` directly unless explicitly required by a specific non-bun tool.

### 2. Linting & Formatting
- **Linter**: Oxlint is configured as the repository linter. Do **NOT** install or reconfigure ESLint.
- Run `bun run lint` and `bun run typecheck` to ensure zero errors or warnings before completing any changes.

### 3. Cryptography & Security
- **No Hand-Rolled Crypto**: Only use standard `node:crypto` for SHA-256 digests and RSA-2048 key operations.
- **Deterministic Serialization**: Canonical payload serialization must always produce identical byte representations before hashing (NFR-03).
- **Key Isolation**: Signing private keys must **never** be sent to client components or exposed in client bundles.
- **Server-Side Enforcement**: Authorization and cryptographic signing must be performed exclusively in server-side contexts (Route Handlers / Server Actions).
- **Append-Only Ledger**: Corrections and edits append a new signed ledger record referencing the previous hash; never perform in-place destructive SQL updates on ledger history.

### 4. UI Components & Visual Identity (shadcn/ui First)
- **STRICTLY USE SHADCN CLI**: NEVER manually hand-roll or create primitive UI components in `components/ui/` that already exist in the shadcn/ui component library.
- **Add Components via CLI**: Always add UI primitives using the official shadcn CLI with the preset:
  ```bash
  bun x shadcn add <component-name>
  ```
  *(Preset configured: `--preset b3Zheoix4U` / `base-sera` style config with `@base-ui/react` and `@phosphor-icons/react`).*
- **Reference Docs & Web Standards**: Consult shadcn web documentation, skills, and registry references when composing and configuring UI elements.
- **Component Separation**:
  - `components/ui/`: Contains ONLY official primitives generated and managed by the shadcn CLI (e.g. `button.tsx`, `dialog.tsx`, `card.tsx`, `input.tsx`, `select.tsx`, `table.tsx`, `separator.tsx`, `badge.tsx`).
  - `components/dashboard/`, `components/records/`, `components/verification/`, `components/common/`: Application-level feature and domain components that **compose** official shadcn UI primitives.
- **Visual Design Language**:
  - Registrar portal aesthetic: dark forest green sidebar (`#061a12`/`#0a2618`), warm paper backgrounds (`#faf9f5`), serif titles, and monospace cryptographic hashes.
  - Clear, accessible status indicators: distinct green **VERIFIED** and red **FLAGGED** states that are legible beyond color alone (icons + text).

### 5. Next.js 16 Conventions
- Default to **React Server Components** (`RSC`). Add `'use client'` only to leaf components requiring interactive state or browser APIs.
- Refer to `node_modules/next/dist/docs/` for version-specific Next.js App Router patterns and APIs.


