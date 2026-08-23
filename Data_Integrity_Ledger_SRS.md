# Software Requirements Specification (SRS)
## Data Integrity Ledger — MVP

**Version:** 1.0  
**Status:** MVP Specification  
**Project Type:** Academic Course Project  
**Primary Goal:** Tamper-evident academic grade records using SHA-256 hash chaining and RSA-2048 digital signatures.

---

## Table of Contents

1. [Document Overview](#1-document-overview)
   1. [Purpose](#11-purpose)
   2. [Core Problem](#12-core-problem)
   3. [Core Security Principle](#13-core-security-principle)
   4. [Scope](#14-scope)
2. [Product Description](#2-product-description)
   1. [Product Name](#21-product-name)
   2. [Product Vision](#22-product-vision)
   3. [Primary Value Proposition](#23-primary-value-proposition)
   4. [Target Users](#24-target-users)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Recommended Technology Stack](#5-recommended-technology-stack)
6. [System Architecture](#6-system-architecture)
7. [Project Folder Structure](#7-project-folder-structure)
8. [Database Design](#8-database-design)
9. [Canonical Record Format](#9-canonical-record-format)
10. [Ledger Creation Flow](#10-ledger-creation-flow)
11. [Verification Flow](#11-verification-flow)
12. [Tampering Scenario](#12-tampering-scenario)
13. [UI/UX Requirements](#13-uiux-requirements)
14. [API Design](#14-api-design)
15. [Security Model](#15-security-model)
16. [Important Security Limitations](#16-important-security-limitations)
17. [MVP Demo Dataset](#17-mvp-demo-dataset)
18. [Testing Requirements](#18-testing-requirements)
19. [Acceptance Criteria](#19-acceptance-criteria)
20. [Environment Variables](#20-environment-variables)
21. [Git/GitHub Requirements](#21-gitgithub-requirements)
22. [Development Phases](#22-development-phases)
23. [MVP Feature Priority](#23-mvp-feature-priority)
24. [Out of Scope for MVP](#24-out-of-scope-for-mvp)
25. [Presentation Narrative](#25-presentation-narrative)
26. [Final MVP Definition](#26-final-mvp-definition)

---

## 1. Document Overview

### 1.1 Purpose

This document defines the requirements, architecture, technology stack, project structure, data model, security model, user flows, verification logic, and MVP scope for the **Academic Integrity Ledger**.

The system is designed to demonstrate that academic grade records can be made **tamper-evident**. The system does not claim to prevent every possible database compromise. Instead, its core contribution is:

> **Tampering may not be preventable, but unauthorized modification must become detectable and provable.**

A conventional database can silently lose the previous value after an `UPDATE`. This project adds cryptographic evidence to grade records so that modification of authenticated data can be detected later.

### 1.2 Core Problem

In a conventional grade database:

```text
Faculty → Application → Database
```

an unauthorized database modification such as:

```sql
UPDATE grade_records
SET grade = 'A+'
WHERE student_id = 102;
```

may replace the previous grade without leaving cryptographic evidence that the previous value was different.

The Academic Integrity Ledger addresses this problem by associating each record with:

- a SHA-256 content hash;
- the hash of the previous ledger record;
- an RSA-2048 digital signature;
- the identity of the authorized signer;
- a timestamp and ledger position.

### 1.3 Core Security Principle

The MVP has two security layers:

**Layer 1 — Authentication and authorization**

Only authenticated faculty users can normally create or modify grades through the application.

**Layer 2 — Cryptographic integrity and authenticity**

If an attacker bypasses the application and modifies the database directly, the modified record should fail cryptographic verification because the attacker does not possess the authorized signing private key and the stored hash no longer matches the current content.

### 1.4 Scope

The MVP includes:

- Faculty authentication.
- Faculty authorization.
- Student and course records.
- Grade creation.
- Grade editing.
- SHA-256 hash generation.
- Sequential hash chaining.
- RSA-2048 digital signatures.
- Signature verification.
- Full ledger verification.
- Tampering detection.
- Controlled tampering simulation for demonstration.
- Dashboard.
- Grade-record browser.
- Cryptographic record details.
- Verification results.
- Basic audit information.
- PostgreSQL persistence.
- Deployment-ready Next.js application.

The MVP does not include:

- Blockchain or distributed consensus.
- Cryptocurrency.
- Multi-university federation.
- Mobile applications.
- Advanced analytics.
- Automated attacker attribution.
- Hardware security modules.
- Production-grade key management infrastructure.
- Complete regulatory/compliance certification.

---

# 2. Product Description

## 2.1 Product Name

**Academic Integrity Ledger**

Alternative short name:

**AILedger**

## 2.2 Product Vision

Create a simple academic grade management system where every grade record has cryptographically verifiable evidence of its authenticated state.

## 2.3 Primary Value Proposition

Traditional authorization asks:

> "Was this user allowed to edit the grade?"

The Academic Integrity Ledger additionally asks:

> "Does the current database record still match the cryptographically authenticated record?"

This distinction is central to the project.

## 2.4 Target Users

### Faculty

Can:

- Sign in.
- Create grade records.
- Edit grades.
- View grade records.
- View cryptographic metadata.
- Run integrity verification.

### Registrar/Admin

For the MVP, the registrar/admin role is primarily an administrative identity and dashboard context. Full advanced administrative workflows are outside MVP scope.

### Unauthorized User / Attacker

Not a legitimate application user.

The MVP represents this actor only through a controlled tampering simulation to demonstrate database-level modification and detection.

---

# 3. Functional Requirements

## FR-01 — Authentication

The system shall provide faculty login.

### Requirements

- A faculty user must authenticate before accessing protected grade-management functionality.
- Invalid credentials shall be rejected.
- Unauthenticated users shall not be allowed to create or edit grades.
- Authentication state shall be maintained through a secure session mechanism.

### MVP

A simple email/password authentication flow is sufficient.

---

## FR-02 — Role-Based Authorization

The system shall distinguish authorized faculty users from unauthorized users.

Minimum roles:

```text
FACULTY
REGISTRAR
ADMIN
```

For the MVP, only authorized faculty users may create or edit grade records.

---

## FR-03 — Faculty Signing Identity

Each authorized faculty signer shall have an associated RSA-2048 key pair.

```text
Private Key → used for signing
Public Key  → stored/registered for verification
```

The private key must never be stored as plaintext in the database.

For the MVP, private keys may be managed through secure environment/configuration mechanisms appropriate to a course project.

---

## FR-04 — Student Management

The system shall maintain student records.

Minimum fields:

```text
id
student_id
name
department
created_at
```

The MVP does not require a complete student administration module.

Seeded/demo students are acceptable.

---

## FR-05 — Course Management

The system shall maintain course information.

Minimum fields:

```text
id
course_code
course_name
created_at
```

Seeded/demo courses are acceptable.

---

## FR-06 — Grade Creation

An authorized faculty user shall be able to create a grade record.

Required information:

- Student.
- Course.
- Grade.
- Faculty signer.
- Timestamp.

When a record is created, the system shall:

1. Determine the previous ledger hash.
2. Construct the canonical record payload.
3. Compute SHA-256.
4. Sign the resulting hash using the faculty's RSA-2048 private key.
5. Store the record and cryptographic metadata.

---

## FR-07 — Grade Editing

An authorized faculty user shall be able to modify a grade through the application.

Every modification must produce a new cryptographically authenticated ledger entry rather than silently destroying the previous authenticated state.

Example:

```text
Original:
B+

Correction:
A-
```

The ledger should preserve evidence of the original authenticated entry and append the corrected state.

The MVP should not implement an in-place destructive update of the cryptographically significant ledger history.

---

## FR-08 — Hash Generation

The system shall use SHA-256.

A canonical payload should include the fields necessary to uniquely authenticate the record, for example:

```text
record_id
student_id
course_id
grade
timestamp
signed_by
prev_hash
```

The exact serialization must be deterministic.

Example conceptual formula:

```text
record_hash =
SHA256(canonical_record_payload)
```

---

## FR-09 — Hash Chain

Each ledger record shall contain:

```text
prev_hash
record_hash
```

Conceptually:

```text
Block 1
  prev_hash = GENESIS
  hash = H1

Block 2
  prev_hash = H1
  hash = H2

Block 3
  prev_hash = H2
  hash = H3
```

This creates a sequential integrity relationship.

If Block 2 changes:

```text
H2(old) ≠ H2(new)
```

then Block 3's `prev_hash` no longer matches.

---

## FR-10 — Digital Signature

Each ledger record shall have an RSA-2048 digital signature.

Conceptually:

```text
signature =
RSA_SIGN(private_key, record_hash)
```

The signature shall be associated with the signer.

Minimum fields:

```text
signature
signed_by
```

---

## FR-11 — Signature Verification

The system shall verify a record signature using the registered public key.

Conceptually:

```text
RSA_VERIFY(
    public_key,
    record_hash,
    signature
)
```

The result shall be:

```text
VALID
```

or:

```text
INVALID
```

---

## FR-12 — Full Ledger Verification

The system shall provide a **Run Full Verification** function.

The verification process shall check:

### A. Hash recomputation

```text
stored_hash === SHA256(current_canonical_payload)
```

### B. Chain linkage

```text
current.prev_hash === previous.record_hash
```

### C. Digital signature

```text
signature verifies against registered public key
```

The verification result shall clearly identify success or failure.

---

## FR-13 — Tampering Detection

If a record is changed directly in the database without generating a valid authenticated ledger state, verification shall flag the record.

Example:

```text
Stored authenticated grade:
B+

Current database grade:
A+
```

Expected result:

```text
Hash mismatch
Signature invalid
Possible unauthorized modification
```

The system shall not claim to identify the exact human attacker unless separate evidence exists.

---

## FR-14 — Tampering Demonstration

The MVP shall include a controlled demonstration mechanism.

Example browser-console API:

```javascript
window.simulateUnauthorizedAccess(
  'Rafiq Ahmed',
  'CSE 323 Midterm',
  'A+'
)
```

The demonstration shall simulate a database-level unauthorized modification without using the normal faculty editing workflow.

After running full verification, the system shall report the resulting discrepancy.

This feature exists for the course presentation/demo and must not be treated as a real security bypass API in production.

---

## FR-15 — Dashboard

The dashboard shall display:

- Total records.
- Current chain status.
- Number of flagged entries.
- Number of registered signers.
- Recent records.
- Chain health.
- Shortcut to full verification.

Example:

```text
Total records        1,284
Chain status         Verified
Flagged entries      0
Registered signers   3
```

---

## FR-16 — Grade Records Page

The system shall display grade records in a table.

Columns:

```text
Student
Course
Grade
Recorded By
Timestamp
Status
```

A user shall be able to select a record to view cryptographic details.

---

## FR-17 — Cryptographic Record Details

For an individual record, the system shall display at minimum:

```text
block_hash
prev_hash
signed_by
signature
verification status
```

Hashes/signatures may be truncated visually while retaining a way to inspect the complete values if needed.

---

## FR-18 — Verification Status

Records shall have a visible status.

MVP statuses:

```text
VERIFIED
FLAGGED
PENDING
```

The primary states are:

### VERIFIED

```text
Hash ✓
Chain ✓
Signature ✓
```

### FLAGGED

One or more integrity/authenticity checks failed.

---

## FR-19 — Search (Optional for MVP)

The records interface should support basic search by:

- Student name.
- Student ID.
- Course code.

This is an MVP usability feature.

---

## FR-20 — Audit Information

The system shall preserve basic event information for grade operations:

```text
actor
action
record
timestamp
```

The MVP may implement this as a separate audit-event table or as an append-only event structure.

A cryptographic ledger record and an application audit event should be treated as conceptually different:

- The ledger proves the authenticated state of the record.
- The audit event records application-level activity.

---

# 4. Non-Functional Requirements

## NFR-01 — Security

The application shall:

- Require authentication for protected operations.
- Enforce authorization server-side.
- Never trust client-side role checks alone.
- Never expose private signing keys to the browser.
- Validate all API inputs.
- Use parameterized database queries/ORM operations.
- Use HTTPS in deployment.
- Protect authentication cookies.
- Avoid logging private keys or sensitive credentials.

---

## NFR-02 — Cryptographic Requirements

The MVP shall use:

```text
Hash: SHA-256
Signature: RSA-2048
```

Cryptographic operations should use well-maintained platform/library implementations rather than custom cryptographic algorithms.

---

## NFR-03 — Integrity

A record's cryptographic state shall be deterministic.

The same canonical payload must always produce the same SHA-256 digest.

---

## NFR-04 — Availability

The MVP should remain usable during normal course-project demonstration traffic.

High availability, multi-region disaster recovery, and enterprise SLA guarantees are outside MVP scope.

---

## NFR-05 — Performance

For an MVP:

- Normal dashboard loading should feel near-instant for a small dataset.
- Individual record verification should complete quickly.
- Full verification should be acceptable for a dataset of several thousand records.
- The system should not block the browser while performing large verification jobs.

---

## NFR-06 — Usability

The UI shall make the security concept understandable to a non-specialist.

A user should be able to understand:

```text
Verified
```

versus:

```text
Discrepancy detected
```

without reading cryptographic implementation details.

---

## NFR-07 — Maintainability

The system shall separate:

```text
UI
API
Authentication
Ledger logic
Cryptography
Database access
```

Cryptographic functions shall not be scattered throughout UI components.

---

# 5. Recommended Technology Stack

## Frontend

```text
Next.js
TypeScript
React
Tailwind CSS
Prisma
```

### UI structure

The current design direction uses:

- Academic/registrar visual language.
- Sidebar navigation.
- Dashboard cards.
- Grade-record tables.
- Verification panel.
- Green verified state.
- Red discrepancy state.
- Monospace cryptographic metadata.

The uploaded UI already implements these major concepts. fileciteturn0file0L25-L40 fileciteturn0file0L63-L80

---

## Backend

Recommended MVP approach:

```text
Next.js App Router
Next.js Route Handlers / Server Actions
```

This avoids maintaining a separate backend service during the MVP.

---

## Database

```text
PostgreSQL
```

Recommended hosted option:

```text
Supabase PostgreSQL
```

The application should communicate with PostgreSQL through an ORM/database layer.

---

## ORM

Recommended:

```text
Prisma
```

Alternative:

```text
Drizzle ORM
```

For the MVP, choose one and use it consistently.

Recommended choice:

**Prisma**

---

## Cryptography

Use Node.js/platform cryptographic APIs where supported:

```text
node:crypto
```

Required capabilities:

```text
SHA-256
RSA-2048 signing
RSA-2048 verification
```

Do not implement SHA-256 or RSA manually.

---

## Authentication

MVP options:

### Option A — Auth.js

Recommended if authentication is implemented directly in the Next.js application.

### Option B — Supabase Auth (Approved ✔️)

Recommended if using Supabase for both authentication and PostgreSQL.

For a simple course project, **Supabase Auth + Supabase PostgreSQL** can reduce infrastructure complexity.

---

## Deployment

Recommended:

```text
Next.js
    ↓
Cloudflare Workers
    ↓
Supabase PostgreSQL
```

Cloudflare Workers hosts the application/runtime while PostgreSQL remains the persistent data layer.

---

## Development Tools

```text
Node.js 20+
npm
Git
GitHub
VS Code
```

Recommended Node.js version:

```text
Node.js 20 LTS or newer supported LTS
```

---

# 6. System Architecture

```text
                         ┌───────────────────┐
                         │      Browser      │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │     Next.js       │
                         │   App Router      │
                         └─────────┬─────────┘
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
                 ▼                 ▼                 ▼
          Authentication      Grade API       Verification API
                 │                 │                 │
                 │                 ▼                 │
                 │          Ledger Service           │
                 │                 │                 │
                 │       ┌─────────┴─────────┐       │
                 │       ▼                   ▼       │
                 │  SHA-256 Hash       RSA-2048 Sign │
                 │       │                   │       │
                 └───────┴─────────┬─────────┴───────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │    PostgreSQL     │
                         │      Ledger       │
                         └───────────────────┘
```

---

# 7. Project Folder Structure

Recommended MVP structure:

```text
academic-integrity-ledger/
│
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── records/
│   │   └── page.tsx
│   │
│   ├── verify/
│   │   └── page.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   ├── grades/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   │
│   │   ├── verification/
│   │   │   └── route.ts
│   │   │
│   │   └── demo/
│   │       └── tamper/
│   │           └── route.ts
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── PageHeader.tsx
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── ChainHealth.tsx
│   │   └── RecentRecords.tsx
│   │
│   ├── records/
│   │   ├── GradeTable.tsx
│   │   ├── GradeRow.tsx
│   │   └── CryptoDetails.tsx
│   │
│   └── verification/
│       ├── VerificationPanel.tsx
│       ├── VerificationChecklist.tsx
│       └── TamperAlert.tsx
│
├── lib/
│   ├── crypto/
│   │   ├── hash.ts
│   │   ├── signature.ts
│   │   ├── keys.ts
│   │   └── verify.ts
│   │
│   ├── ledger/
│   │   ├── create-record.ts
│   │   ├── append-record.ts
│   │   ├── chain.ts
│   │   └── verify-ledger.ts
│   │
│   ├── auth/
│   │   ├── session.ts
│   │   └── authorization.ts
│   │
│   ├── db/
│   │   └── prisma.ts
│   │
│   └── utils/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── scripts/
│   ├── generate-keys.ts
│   └── simulate-tampering.ts
│
├── public/
│   ├── icons/
│   └── images/
│
├── tests/
│   ├── crypto/
│   │   ├── hash.test.ts
│   │   └── signature.test.ts
│   │
│   ├── ledger/
│   │   ├── chain.test.ts
│   │   └── verification.test.ts
│   │
│   └── api/
│
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── prisma.config.ts
├── tsconfig.json
├── wrangler.jsonc
└── README.md
```

---

# 8. Database Design

## 8.1 User

```text
User
----
id
name
email
password/auth_provider_id
role
public_key
created_at
updated_at
```

---

## 8.2 Student

```text
Student
-------
id
student_id
name
department
created_at
updated_at
```

---

## 8.3 Course

```text
Course
------
id
course_code
course_name
created_at
updated_at
```

---

## 8.4 Grade Record

```text
GradeRecord
-----------
id
student_id
course_id
grade

block_index
prev_hash
record_hash

signature
signed_by

created_at
```

Relationships:

```text
Student 1 ──────── * GradeRecord
Course  1 ──────── * GradeRecord
User    1 ──────── * GradeRecord
```

---

## 8.5 Audit Event

```text
AuditEvent
----------
id
actor_id
action
target_record_id
metadata
created_at
```

Example actions:

```text
GRADE_CREATED
GRADE_CORRECTED
VERIFICATION_RUN
TAMPER_DETECTED
```

---

# 9. Canonical Record Format

A major implementation requirement is deterministic serialization.

Example:

```json
{
  "id": "GR-000842",
  "student_id": "20261234",
  "course_id": "CSE323",
  "grade": "B+",
  "block_index": 842,
  "prev_hash": "abc123...",
  "signed_by": "faculty-001",
  "created_at": "2026-08-02T10:14:00.000Z"
}
```

The fields must be serialized in a deterministic order before hashing.

Example conceptual function:

```ts
canonicalize(record)
```

must always produce the same byte/string representation for the same logical record.

---

# 10. Ledger Creation Flow

```text
Faculty submits grade
        ↓
Authenticate user
        ↓
Authorize faculty
        ↓
Validate input
        ↓
Get latest ledger hash
        ↓
Build canonical payload
        ↓
SHA-256
        ↓
Sign hash with RSA private key
        ↓
Store GradeRecord
        ↓
Create audit event
        ↓
Return verified record
```

---

# 11. Verification Flow

```text
User clicks "Run Full Verification"
                ↓
Load ledger records in block order
                ↓
For each record:
                │
                ├── Rebuild canonical payload
                │
                ├── Recalculate SHA-256
                │
                ├── Compare record_hash
                │
                ├── Check prev_hash
                │
                └── Verify RSA signature
                ↓
Aggregate results
                ↓
Display VERIFIED or FLAGGED
```

---

# 12. Tampering Scenario

Normal state:

```text
Grade = B+

Hash = H(B+)

Signature = Sign(H(B+))
```

Attacker changes database:

```text
Grade = A+
```

But does not update valid cryptographic fields.

Verification:

```text
SHA256(A+) != stored hash
```

and:

```text
RSA verification fails
```

Result:

```text
FLAGGED
```

The system should show:

```text
Original authenticated value: B+
Current database value: A+
Hash status: FAILED
Signature status: FAILED
Chain status: FAILED/IMPACTED
```

---

# 13. UI/UX Requirements

## Dashboard

The dashboard should contain:

1. Header.
2. Search.
3. Statistics.
4. Chain health.
5. Recent grade records.
6. Verification shortcut.

The existing UI uses a registrar-portal style with a dark green sidebar, warm paper background, serif headings, and monospace cryptographic values. This visual direction can be retained for the Next.js MVP. fileciteturn0file0L10-L19

## Grade Records

Required:

- Table.
- Search.
- Status indicators.
- Record expansion.
- Cryptographic metadata.
- New record action.

## Verify Integrity

Required:

- Explanation of what verification checks.
- Run Full Verification button.
- Hash check result.
- Chain check result.
- Signature check result.
- Success state.
- Tamper/discrepancy state.
- Demo tampering action.

The existing verification UI already describes recomputing hashes, checking chain links, and validating RSA signatures. fileciteturn0file0L233-L251

---

# 14. API Design

## POST `/api/grades`

Create a new grade.

### Request

```json
{
  "studentId": "20261234",
  "courseId": "CSE323",
  "grade": "B+"
}
```

### Response

```json
{
  "id": "GR-000842",
  "status": "VERIFIED"
}
```

---

## PATCH `/api/grades/:id`

Correct an existing grade.

The server must:

- Authenticate.
- Authorize.
- Create a new authenticated ledger state.
- Preserve the previous state.

---

## GET `/api/grades`

Return grade records.

Supported query parameters:

```text
?q=Rafiq
&course=CSE323
&page=1
```

---

## GET `/api/grades/:id`

Return a single grade record including cryptographic metadata.

---

## POST `/api/verification`

Run ledger verification.

### Response

```json
{
  "status": "FAILED",
  "total": 1284,
  "valid": 1283,
  "invalid": 1,
  "issues": [
    {
      "recordId": "GR-000842",
      "hashValid": false,
      "chainValid": false,
      "signatureValid": false
    }
  ]
}
```

---

## POST `/api/demo/tamper`

MVP-only controlled demonstration endpoint.

This endpoint should:

- Require an explicit demo/admin condition.
- Be disabled or removed in a production deployment.
- Never expose database credentials.
- Modify only a designated demo/test record.

---

# 15. Security Model

## Threats

The MVP considers:

### Threat 1 — Unauthorized application access

Mitigation:

```text
Authentication
+
Authorization
```

### Threat 2 — Direct database modification

Mitigation:

```text
SHA-256 integrity verification
+
Hash chaining
+
RSA signature verification
```

### Threat 3 — Modified grade with unchanged signature

Detection:

```text
Hash mismatch
+
Signature verification failure
```

### Threat 4 — Modified record and modified hash

Detection:

If the attacker changes both the record and hash but cannot produce a valid RSA signature, signature verification fails.

### Threat 5 — Modified historical block

Detection:

The block's hash changes and subsequent `prev_hash` relationships can become invalid.

---

# 16. Important Security Limitations

The MVP must explicitly document these limitations.

## 16.1 It is tamper-evident, not tamper-proof

A database administrator with unrestricted control may modify data.

The objective is to make the modification **detectable**, not physically impossible.

## 16.2 Key compromise

If an attacker obtains a legitimate faculty private signing key, they may be able to generate valid signatures.

Therefore:

```text
Private key security
```

is a critical trust assumption.

## 16.3 Database rollback

If an attacker can completely roll back the database to an earlier valid state and also control all external evidence, detection may be difficult.

A production system would need independent trusted storage, external timestamping, or another trust anchor.

## 16.4 Attacker attribution

Cryptographic verification can prove that a record does not match its authenticated state.

It does not automatically prove who performed the unauthorized modification.

---

# 17. MVP Demo Dataset

Use a small realistic dataset.

Example faculty:

```text
S. H. Mamun
Sharifur Rahman
Mahbubur Rahman
```

Example courses:

```text
CSE 323 Midterm
CSE 315 Final
CSE 208 Quiz 3
```

Example students:

```text
Rafiq Ahmed
Nusrat Jahan
Tanvir Islam
Farhana Akter
Imran Kabir
Sadia Rahman
Mahin Hasan
Proma Chowdhury
```

These names and records are consistent with the existing UI prototype. fileciteturn0file0L274-L284

---

# 18. Testing Requirements

## Unit Tests

### Hash

Test:

```text
Same input → same hash
Different input → different hash
```

### Signature

Test:

```text
Valid signature → verification succeeds
Modified data → verification fails
Wrong key → verification fails
```

### Chain

Test:

```text
Valid chain → passes
Modified previous hash → fails
Modified historical record → downstream linkage fails
```

### Verification

Test combinations:

```text
Hash ✓ / Chain ✓ / Signature ✓ → VERIFIED

Hash ✗ / Chain ✗ / Signature ✗ → FLAGGED

Hash ✓ / Chain ✓ / Signature ✗ → FLAGGED
```

---

# 19. Integration Tests

Minimum integration scenarios:

### Scenario A — Create valid record

```text
Login
→ Create grade
→ Record signed
→ Verify
→ PASS
```

### Scenario B — Correct grade through application

```text
Login
→ Edit grade
→ New authenticated ledger state
→ Verify
→ PASS
```

### Scenario C — Direct database tampering

```text
Create B+
→ Modify database to A+
→ Run verification
→ FLAGGED
```

### Scenario D — Invalid signature

```text
Modify signature
→ Run verification
→ FLAGGED
```

### Scenario E — Broken chain

```text
Modify prev_hash
→ Run verification
→ FLAGGED
```

---

# 20. Acceptance Criteria

The MVP is considered complete when:

- [ ] Faculty can log in.
- [ ] Unauthorized users cannot access protected grade operations.
- [ ] Faculty can create a grade record.
- [ ] A new record receives a SHA-256 hash.
- [ ] Each record references the previous record hash.
- [ ] Each record receives an RSA-2048 signature.
- [ ] A valid record passes verification.
- [ ] A modified record fails hash verification.
- [ ] A modified record fails signature verification where applicable.
- [ ] A broken chain is detected.
- [ ] The UI clearly reports discrepancies.
- [ ] Users can inspect cryptographic record details.
- [ ] Dashboard displays ledger health.
- [ ] Controlled tampering simulation works.
- [ ] Automated tests cover core cryptographic and ledger logic.
- [ ] The project can be deployed as a Next.js application.
- [ ] Private keys are not committed to Git.
- [ ] `.env.example` documents required configuration.

---

# 21. Environment Variables

Example `.env.example`:

```env
DATABASE_URL=

NEXTAUTH_SECRET=

# RSA signing configuration
LEDGER_SIGNING_KEY=
LEDGER_PUBLIC_KEY=

# Optional demo configuration
ENABLE_TAMPER_DEMO=false
```

Actual secrets must never be committed.

---

# 22. Git/GitHub Requirements

Recommended branches:

```text
main
develop
feature/*
```

Recommended commits:

```text
feat: add faculty authentication
feat: implement ledger hashing
feat: implement RSA signing
feat: add grade records
feat: add full verification
feat: add tamper demonstration
test: add ledger verification tests
fix: handle invalid signatures
```

Never commit:

```text
.env
private keys
database passwords
production credentials
```

---

# 23. Development Phases

## Phase 1 — Foundation

- Initialize Next.js.
- Configure TypeScript.
- Configure Tailwind.
- Configure PostgreSQL.
- Configure Prisma.
- Create database schema.

## Phase 2 — Authentication

- Faculty users.
- Login.
- Session.
- Authorization.

## Phase 3 — Ledger

- Canonical record generation.
- SHA-256.
- `prev_hash`.
- RSA signing.
- Record persistence.

## Phase 4 — Grade Management

- Create grade.
- Correct grade.
- Grade list.
- Record details.

## Phase 5 — Verification

- Hash verification.
- Chain verification.
- Signature verification.
- Full verification API.

## Phase 6 — UI

- Dashboard.
- Grade records.
- Verification screen.
- Status indicators.
- Tamper alert.

## Phase 7 — Demo

- Controlled tampering simulation.
- Seed data.
- Presentation flow.

## Phase 8 — Testing and Deployment

- Unit tests.
- Integration tests.
- Security review.
- Cloudflare deployment.
- Production environment configuration.

---

# 24. MVP Feature Priority

## P0 — Must Have

```text
Authentication
Authorization
Grade creation
Grade correction
SHA-256 hashing
Hash chain
RSA-2048 signing
Signature verification
Full ledger verification
Tamper detection
Dashboard
Grade records
Verification UI
PostgreSQL persistence
```

## P1 — Should Have

```text
Search
Audit events
Seed/demo data
Automated tests
Tamper simulation
Verification report
```

## P2 — Future

```text
Public verification
PDF evidence report
Key rotation
External timestamping
Independent audit storage
Advanced admin panel
Notifications
Analytics
Multi-institution support
```

---

# 25. Out of Scope for MVP

Do not expand the MVP with:

- Blockchain.
- Smart contracts.
- Cryptocurrency.
- Distributed consensus.
- AI-based fraud detection.
- Complex microservices.
- Mobile applications.
- Kubernetes.
- Multi-region databases.
- Hardware security modules.
- Biometric authentication.
- Student self-service portals.
- Full university ERP integration.

The goal is to make the cryptographic integrity mechanism **correct, demonstrable, and understandable**.

---

# 26. Presentation Narrative

The recommended presentation narrative is:

### Problem

> "স্যার, সাধারণ database-এ কেউ যদি grade বদলে দেয়, পুরনো value overwrite হয়ে যেতে পারে। কে কখন কী বদলালো—সেটা cryptographically prove করার কোনো ব্যবস্থা থাকে না।"

### Solution

> "আমরা SHA-256 hash chain এবং RSA-2048 digital signature ব্যবহার করে একটি tamper-evident ledger তৈরি করেছি।"

### Security

> "Login সাধারণ unauthorized access আটকায়। কিন্তু কেউ application bypass করে database পরিবর্তন করলেও cryptographic verification সেটা detect করতে পারে।"

### Demonstration

```text
B+
 ↓
Unauthorized DB modification
 ↓
A+
 ↓
Run verification
 ↓
HASH MISMATCH
SIGNATURE INVALID
CHAIN BROKEN
 ↓
UNAUTHORIZED MODIFICATION DETECTED
```

### Main contribution

> **"আমাদের system tampering prevent করার দাবি করে না; tampering হলে সেটা detect এবং cryptographic evidence দিয়ে prove করে।"**

---

# 27. Final MVP Definition

The MVP can be summarized as:

```text
                         ACADEMIC INTEGRITY LEDGER

                              Faculty Login
                                   │
                                   ▼
                          Grade Management
                                   │
                                   ▼
                         Canonical Record
                                   │
                          ┌────────┴────────┐
                          ▼                 ▼
                      SHA-256          RSA-2048
                       Hashing           Signing
                          │                 │
                          └────────┬────────┘
                                   ▼
                           PostgreSQL Ledger
                                   │
                                   ▼
                          Full Verification
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
                 Hash Check    Chain Check    Signature Check
                    │              │              │
                    └──────────────┼──────────────┘
                                   ▼
                         ┌───────────────────┐
                         │                   │
                         ▼                   ▼
                     VERIFIED             FLAGGED
                                           │
                                           ▼
                              Tampering Evidence
```

**MVP success condition:**

> Given a valid signed grade record, if an unauthorized party changes the database value without producing a valid new authenticated ledger state, the system must detect the inconsistency during verification and clearly show the affected record and failed cryptographic checks.
