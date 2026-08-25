/*
  Impeccable direction contract — DILedger Applications page (extension of the landing's committed world)
  THESIS: The tamper-evident ledger is a pattern, not a product vertical — show the same SHA-256 chain re-sealing transcripts, research data, medical records, supply chains, and land registries without changing a single cryptographic primitive.
  OWN-WORLD: identical to landing — Supabase grammar via theme tokens (bg-background, bg-card, text-primary…) so next-themes light/dark switching works.
  STRUCTURE: Domain-index hero (chips of every sealed record type) → "Across the university" five-card grid → "Beyond campus" six-card industry grid → "Same chain, different payload" comparison panel → honest-scope note → CTA back to portal.
  HONESTY: illustrative payloads only, labeled as such; no fabricated institutions, customers, or metrics.
*/
import type { Metadata } from "next"

import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "Applications — Data Integrity Ledger",
  description:
    "The same hash-chained, signed-record pattern applied across a university — transcripts, research data, admissions, financial aid — and beyond it: healthcare, supply chains, legal filings, land registries.",
}

interface ChainRow {
  n: number
  label: string
  meta: string
  prev: string
  hash: string
}

// ponytail: precomputed SHA-256 digests over the seeded demo dataset (SRS §17) — static to avoid node:crypto in Turbopack RSC
const CHAIN_ROWS: ChainRow[] = [
  {
    n: 1,
    label: "Genesis block",
    meta: "LEDGER OPENED · 2026-08-01",
    prev: "0000000000000000000000000000000000000000000000000000000000000000",
    hash: "5f2a8eb1fdc3301abeb397214c5a9754edf52ae15018de6e891a85d4c6489a2b",
  },
  {
    n: 2,
    label: "Rafiq Ahmed",
    meta: "CSE 323 Operating Systems · Midterm · 85",
    prev: "5f2a8eb1fdc3301abeb397214c5a9754edf52ae15018de6e891a85d4c6489a2b",
    hash: "af98e40520d42ebafcd4a2a6180bb24123f34f621428a408484a985ed4188d75",
  },
  {
    n: 3,
    label: "Nusrat Jahan",
    meta: "CSE 315 Database Systems · Final · 90",
    prev: "af98e40520d42ebafcd4a2a6180bb24123f34f621428a408484a985ed4188d75",
    hash: "fde0e15c2a9a1f3a779f7df7cc27aff84be7352a90e27e509c2573eb026f39db",
  },
]

const short = (h: string) => `${h.slice(0, 10)}…${h.slice(-6)}`

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  chain:
    "M9 15l6-6M11 5.5 13.5 3a4.95 4.95 0 1 1 7 7L18 12.5M13 18.5 10.5 21a4.95 4.95 0 1 1-7-7L6 11.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  scroll:
    "M8 3h10a2 2 0 0 1 2 2v12M8 3a2 2 0 0 0-2 2v14a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 3v14a2 2 0 0 1-2 2h12a2 2 0 0 0 2-2M11 8h6M11 12h6",
  flask:
    "M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3M8.5 3h7M7.5 15h9",
  inbox:
    "M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6l2-8zM3 13v6h18v-6",
  wallet:
    "M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2M3 7v10a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2zm13 5.5h.01",
  heart:
    "M12 20s-7.5-4.6-9.3-9.4C1.4 7 3.7 4 6.9 4c2 0 3.7 1.1 5.1 3 1.4-1.9 3-3 5.1-3 3.2 0 5.5 3 4.2 6.6C19.5 15.4 12 20 12 20z",
  truck:
    "M1 8h12v8H1zM13 11h4l3 3v2h-7M5.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  scale:
    "M12 3v18M8 21h8M12 6h7l-2.5 6a3 3 0 0 1-5 0L12 6zM5 6l2.5 6a3 3 0 0 1-5 0L5 6zM5 6h14",
  landmark:
    "M3 21h18M4 18h16M6 18v-7M10 18v-7M14 18v-7M18 18v-7M3 8l9-5 9 5v2H3V8z",
  mic: "M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM6 11a6 6 0 0 0 12 0M12 17v4M8 21h8",
  clipboard:
    "M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1zM9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 12l2 2 4-4",
}

const btnPrimary =
  "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2"

const btnSecondary =
  "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:border-muted-foreground/40 hover:bg-accent focus-visible:outline-2"

const UNIVERSITY_APPLICATIONS: Array<{
  icon: string
  title: string
  body: string
  payload: string
}> = [
  {
    icon: ICONS.scroll,
    title: "Official transcripts",
    body: "A transcript issued today can be re-proven years later: recompute the canonical payload, verify the signature against the faculty public key, confirm the chain still links. No archive office required.",
    payload: '{\n  "record_type": "transcript",\n  "student_id": "std-001",\n  "term_gpa": 3.67,\n  "courses": ["CSE 323", "CSE 315"],\n  "prev_hash": "af98e40520d42eba…188d75"\n}',
  },
  {
    icon: ICONS.chain,
    title: "Degree conferrals",
    body: "The graduation decision itself becomes a signed block. Employers and other universities verify authenticity independently instead of calling the registrar.",
    payload: '{\n  "record_type": "degree_conferral",\n  "student_id": "std-002",\n  "degree": "B.Sc. CSE",\n  "conferral_date": "2026-08-01",\n  "signed_by": "registrar-001"\n}',
  },
  {
    icon: ICONS.flask,
    title: "Research data & lab notebooks",
    body: "Timestamp experimental results into the chain as they are produced. Authorship disputes and after-the-fact data edits become detectable — the notebook proves itself.",
    payload: '{\n  "record_type": "lab_entry",\n  "project_id": "res-014",\n  "entry_hash": "sha256(raw_data)",\n  "researcher": "fac-rahman-002",\n  "observed_at": "2026-08-01T09:00:00Z"\n}',
  },
  {
    icon: ICONS.inbox,
    title: "Admissions decisions",
    body: "Seal admission files at decision time. A rejected applicant — or an auditor — can later prove the decision was not altered after the fact.",
    payload: '{\n  "record_type": "admission_decision",\n  "applicant_id": "app-107",\n  "decision": "ACCEPTED",\n  "decided_by": "committee-cse-2026",\n  "prev_hash": "de50173c9a48…aa544"\n}',
  },
  {
    icon: ICONS.wallet,
    title: "Scholarships & financial aid",
    body: "Every disbursement is an append-only block referencing the award it fulfills. Missing or duplicated payments surface as chain breaks, not spreadsheet drift.",
    payload: '{\n  "record_type": "disbursement",\n  "award_id": "sch-032",\n  "amount_bdt": 25000,\n  "period": "2026-autumn",\n  "approved_by": "admin-finance-001"\n}',
  },
]

const INDUSTRY_APPLICATIONS: Array<{
  icon: string
  title: string
  body: string
}> = [
  {
    icon: ICONS.heart,
    title: "Medical records",
    body: "Each entry in a patient chart — diagnosis, prescription, lab result — chained and signed by the clinician who made it. Silent edits to a patient history become provable breaches.",
  },
  {
    icon: ICONS.truck,
    title: "Supply-chain provenance",
    body: "Custody handoffs for goods — pharma cold chains, conflict minerals, food safety — recorded as signed blocks. A forged origin claim breaks every link downstream of it.",
  },
  {
    icon: ICONS.scale,
    title: "Legal & court filings",
    body: "File documents into the chain at submission time. Both parties can prove which version existed when — no more disputes over which draft was actually filed.",
  },
  {
    icon: ICONS.landmark,
    title: "Land & asset registries",
    body: "Property transfers as an append-only chain: the deed history reads forward from genesis, and any retroactive rewrite invalidates everything after it.",
  },
  {
    icon: ICONS.mic,
    title: "Journalism & whistle-blowing",
    body: "Commit source material to the chain before publication. Newsrooms can later prove a document was in hand at a specific date, unchanged.",
  },
  {
    icon: ICONS.clipboard,
    title: "Internal audit trails",
    body: "Any organization that writes records people depend on — payroll, permits, quality control — gets the same guarantee: detection over prevention.",
  },
]

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Icon d={ICONS.chain} className="size-4" />
              </span>
              <span className="hidden text-sm font-semibold tracking-tight whitespace-nowrap text-foreground min-[420px]:block">
                Data Integrity Ledger
              </span>
            </a>
            <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <a href="/#products" className="transition-colors hover:text-foreground">
                Products
              </a>
              <a
                href="#university"
                className="text-foreground transition-colors"
                aria-current="page"
              >
                Applications
              </a>
              <a href="/#verification" className="transition-colors hover:text-foreground">
                Verification
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/" className={`${btnSecondary} max-sm:hidden`}>
              Back to overview
            </a>
            <a href="/dashboard" className={btnPrimary}>
              Open Dashboard
            </a>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-220px] left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.13]"
          style={{
            background:
              "radial-gradient(closest-side, var(--primary) 0%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-16 text-center md:px-8 md:pt-28 md:pb-20">
          <p className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
            One pattern · many ledgers
          </p>
          <h1 className="rise mx-auto mt-5 max-w-3xl text-4xl leading-[1.05] font-medium tracking-tight text-balance text-foreground sm:text-6xl">
            Grades were the first seal.
            <br />
            <span className="text-muted-foreground/50">Not the only one.</span>
          </h1>
          <p className="rise mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Nothing in the core mechanism knows what a grade is. Swap the
            canonical payload — a transcript, a lab result, a deed, a filing —
            and the same SHA-256 chain, RSA-2048 signatures, and verification
            runner apply unchanged.
          </p>
          {/* domain index chips */}
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {[
              "Transcripts",
              "Degrees",
              "Research data",
              "Admissions",
              "Financial aid",
              "Medical records",
              "Supply chains",
              "Court filings",
              "Land registries",
            ].map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] text-muted-foreground"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Across the university ── */}
      <section id="university" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <p className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
          Across the university
        </p>
        <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
          Five more offices that need the same guarantee
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Every one of these is the same shape as a grade: a high-stakes record
          written once by an accountable person, stored in a database someone
          else administers.
        </p>

        <div className="mt-12 space-y-5">
          {UNIVERSITY_APPLICATIONS.map((app, i) => (
            <div
              key={app.title}
              className="grid gap-0 overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-muted-foreground/40 md:grid-cols-[1fr_360px]"
            >
              <div className="flex gap-4 p-6">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon d={app.icon} className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    <span className="mr-2 font-mono text-xs text-primary/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {app.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {app.body}
                  </p>
                </div>
              </div>
              <pre className="overflow-x-auto border-t border-border bg-background p-4 font-mono text-[11px] leading-relaxed whitespace-pre text-muted-foreground md:border-t-0 md:border-l">
                <code>{app.payload}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* ── Beyond campus ── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
            Beyond campus
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
            Anywhere a database edit could quietly rewrite the truth
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRY_APPLICATIONS.map((app) => (
              <div
                key={app.title}
                className="rounded-lg border border-border bg-background p-6 transition-colors hover:border-primary/30"
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon d={app.icon} className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-medium text-foreground">
                  {app.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {app.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Same chain, different payload ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <p className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
              What changes — and what doesn&apos;t
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
              The payload moves. The chain does not.
            </h2>
            <ul className="mt-8 divide-y divide-border/50 rounded-lg border border-border bg-card">
              {[
                [
                  "Changes",
                  "The canonical payload schema — record_type, fields, signer role, retention rules.",
                ],
                [
                  "Changes",
                  "Who holds signing keys — faculty, registrars, clinicians, customs officers, notaries.",
                ],
                [
                  "Never changes",
                  "SHA-256 over deterministic serialization, prev_hash chaining, RSA-2048 signatures, full-chain replay.",
                ],
                [
                  "Never changes",
                  "The promise: tampering may not be preventable, but it will be detectable and provable.",
                ],
              ].map(([tag, body]) => (
                <li
                  key={body}
                  className="flex items-start gap-3.5 px-5 py-4 text-sm leading-relaxed"
                >
                  <span
                    className={`mt-0.5 inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase shadow-xs ${
                      tag === "Changes"
                        ? "border-border bg-accent text-muted-foreground"
                        : "border-primary/30 bg-primary/10 text-primary"
                    }`}
                  >
                    {tag.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{body}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="overflow-hidden rounded-lg border border-border bg-background">
            <figcaption className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="font-mono text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                Hash chain · demo dataset
              </span>
              <span className="font-mono text-[11px] text-primary">sha256</span>
            </figcaption>
            <ol className="divide-y divide-border/50">
              {CHAIN_ROWS.map((row) => (
                <li key={row.n} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="font-mono text-[11px] font-bold text-primary/70">
                        #{String(row.n).padStart(3, "0")}
                      </span>
                      <span className="truncate text-xs font-medium text-foreground">
                        {row.label}
                      </span>
                    </span>
                    <span className="hidden shrink-0 font-mono text-[10px] text-muted-foreground/50 sm:block">
                      {row.meta.split("·")[2]?.trim() ?? ""}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">
                    {row.meta}
                  </p>
                  <div
                    className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 font-mono text-[10px] leading-relaxed"
                    title={`prev_hash ${row.prev}`}
                  >
                    <span className="text-muted-foreground/50">prev</span>
                    <span className="truncate text-muted-foreground">{short(row.prev)}</span>
                    <span className="text-muted-foreground/50">hash</span>
                    <span className="truncate text-primary">{short(row.hash)}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground/50">
              Illustrative demo data · a transcript ledger would carry different
              payloads under identical hashes
            </p>
          </figure>
        </div>
      </section>

      {/* ── Honest scope note ── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 md:flex-row md:items-center md:gap-6 md:px-8">
          <p className="shrink-0 font-mono text-[11px] font-medium tracking-widest text-primary uppercase">
            Scope note
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            These are directions the same architecture generalizes to, not
            shipped modules. This MVP implements the academic grade ledger per
            the SRS; the cryptographic core — canonical hashing, chaining,
            signing, verification — is exactly the part that carries over
            unchanged.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden border-t border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-260px] left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.12]"
          style={{
            background:
              "radial-gradient(closest-side, var(--primary) 0%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center md:px-8 md:py-28">
          <h2 className="mx-auto max-w-2xl text-3xl font-medium tracking-tight text-balance text-foreground md:text-5xl">
            See the pattern working on real records.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            The grade ledger is live in this demo — inspect the chain, run full
            verification, and watch tampering get flagged.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="/dashboard" className={btnPrimary}>
              Open Dashboard
              <Icon d={ICONS.arrow} className="size-4" />
            </a>
            <a href="/" className={btnSecondary}>
              Back to overview
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 md:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Icon d={ICONS.chain} className="size-4" />
            </span>
            <span className="text-sm font-semibold text-foreground">
              Data Integrity Ledger
            </span>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground/50">
            Detection over prevention · evidence over assertion
          </p>
        </div>
      </footer>
    </div>
  )
}
