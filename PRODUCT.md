# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui (`base-sera`) · Prisma → PostgreSQL (Supabase) · Supabase Auth · `node:crypto` · **Bun** as package manager and script runner (use `bun install`, `bun run`, never npm/yarn/pnpm) · Deploy target: **Cloudflare Workers (free tier)** with Supabase as the persistent data layer.

## Users

- **Faculty** (primary): signs in, creates grade records, corrects grades, inspects cryptographic metadata, runs full integrity verification.
- **Registrar/Admin**: administrative identity and dashboard context; advanced admin workflows are out of MVP scope.
- **Unauthorized user / attacker**: not an application user; represented only by the controlled tampering simulation used in demos.

## Product Purpose

An academic grade management system where every grade record carries cryptographically verifiable evidence of its authenticated state. Conventional databases can silently overwrite a grade via a direct SQL update; this system attaches to each record a SHA-256 content hash, the previous record's hash, and an RSA-2048 signature so unauthorized modification becomes detectable after the fact. Success = given a valid signed record, any database change that does not produce a new valid authenticated ledger state is detected by full verification and clearly shown with the affected record and failed checks.

## Positioning

Traditional authorization asks "was this user allowed to edit?"; this product additionally asks "does the current database record still match the cryptographically authenticated record?" Tampering may not be preventable, but unauthorized modification must become detectable and provable. A neighboring plain CRUD registrar app could not truthfully claim this.

## Operating Context

Academic course-project MVP built strictly to `Academic_Integrity_Ledger_SRS.md` (development process, phases FR-01–FR-20, NFR-01–NFR-07, acceptance criteria §20 are binding). Demonstration context: classroom presentation with seeded demo dataset (faculty S. H. Mamun / Sharifur Rahman / Mahbubur Rahman; courses CSE 323 Midterm, CSE 315 Final, CSE 208 Quiz 3; eight named students) and a controlled tamper demonstration (`POST /api/demo/tamper`, gated by `ENABLE_TAMPER_DEMO`).

## Capabilities and Constraints

- Crypto: SHA-256 hashing, sequential hash chaining (`prev_hash` → `record_hash`), RSA-2048 sign/verify — exclusively via `node:crypto`; no hand-rolled crypto.
- Ledger is append-only: grade corrections append a new authenticated entry; no in-place destructive updates of cryptographically significant history.
- Roles `FACULTY` / `REGISTRAR` / `ADMIN`; authorization enforced server-side only; private signing keys never reach the browser or git.
- Record statuses: `VERIFIED`, `FLAGGED`, `PENDING`.
- Deterministic canonical serialization before hashing (NFR-03).
- **UI components: shadcn/ui only**, standard usage rules; visual direction follows the SRS's registrar-portal concept (dark green sidebar, warm paper background, serif headings, monospace cryptographic values) when design work begins.
- Hosting constraint: Cloudflare Workers free tier — keep verification jobs bounded, no blocking browser during large verifications (NFR-05).
- Out of scope (SRS §25): blockchain, smart contracts, mobile apps, microservices, HSMs, student self-service portals.

## Brand Commitments

Name: **Academic Integrity Ledger**, short form **AILedger**.

## Evidence on Hand

- `Academic_Integrity_Ledger_SRS.md` — complete binding spec: functional/non-functional requirements, DB design, canonical format, API contracts, threat model, demo dataset, test matrix, acceptance criteria.
- No real institutional data exists; never fabricate testimonials, institutions, or production claims.

## Product Principles

1. Evidence over prevention — tamper-evident, never claimed tamper-proof.
2. Deterministic truth — same canonical payload always yields the same digest.
3. Legible security — verified vs. discrepancy states understandable without crypto knowledge (NFR-06).
4. Append-only corrections — edits add authenticated history instead of destroying it.
5. Honest limits — document key-compromise, rollback, and attribution limitations explicitly (SRS §16).

## Accessibility & Inclusion

Verification outcomes (VERIFIED / FLAGGED) must be distinguishable beyond color alone and comprehensible to non-specialists; standard keyboard and screen-reader support via shadcn/ui primitives.
