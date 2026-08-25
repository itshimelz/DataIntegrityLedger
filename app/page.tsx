/*
  Impeccable direction contract — Data Integrity Ledger landing (Supabase-style redesign)
  THESIS: The registrar ledger presented with the developer-platform confidence of supabase.com — dark, centered, evidence-first — instead of a brochure hero.
  OWN-WORLD: Supabase grammar driven entirely by theme tokens (bg-background, bg-card, text-primary…) so next-themes light/dark switching works; dark theme carries the original near-black palette, light theme the warm paper one.
  STORY: Visitor reads the one-line promise, sees the real dashboard mock, scans four product cards (ledger, signing, verification, tamper), and clicks through to the portal.
  FIRST VIEWPORT: Slim dark nav (wordmark, anchor links, Open Dashboard), centered announcement pill, two-line giant headline, subcopy, dual CTA, full-width dashboard mock in a glowing frame.
  FORM: Brief-pinned — the supabase.com landing grammar is the committed world; DILedger facts fill every slot, no fabricated customers or claims.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
*/
import type { Metadata } from "next"

import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "Data Integrity Ledger — Tamper-evident grade records",
  description:
    "Every grade record sealed with SHA-256 hash chaining and RSA-2048 faculty signatures. Unauthorized database changes become detectable and provable.",
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
  {
    n: 4,
    label: "Tanvir Islam",
    meta: "CSE 208 Data Structures · Quiz 3 · 78",
    prev: "fde0e15c2a9a1f3a779f7df7cc27aff84be7352a90e27e509c2573eb026f39db",
    hash: "de50173c9a48958d2603bb04305a51f4d941fdbe3cb5c68b763a203b1d5aa544",
  },
]

const short = (h: string) => `${h.slice(0, 10)}…${h.slice(-6)}`

// ponytail: inline SVGs keep the landing a zero-JS server component (phosphor tree is client-side)
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
  check: "M4 12.5l5 5L20 6.5",
  x: "M5 5l14 14M19 5L5 19",
  database:
    "M12 3c4.97 0 9 1.34 9 3s-4.03 3-9 3-9-1.34-9-3 4.03-3 9-3zM3 6v12c0 1.66 4.03 3 9 3s9-1.34 9-3V6M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3",
  key: "M15 9a6 6 0 1 0-5.86 6L11 13.14V15h1.86l1.14 1.14V18h2v2h4v-3.14L15.86 12A6 6 0 0 0 15 9zM9.5 9.5h.01",
  shield: "M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3zM9 12l2 2 4-4",
  terminal: "M4 17l6-5-6-5M12 19h8",
  arrow: "M5 12h14M13 6l6 6-6 6",
  lock: "M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  zap: "M13 2L4.5 13.5H11l-1 8.5L18.5 10.5H12l1-8.5z",
  scroll:
    "M8 3h10a2 2 0 0 1 2 2v12M8 3a2 2 0 0 0-2 2v14a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 3v14a2 2 0 0 1-2 2h12a2 2 0 0 0 2-2M11 8h6M11 12h6",
  flask:
    "M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3M8.5 3h7M7.5 15h9",
  heart:
    "M12 20s-7.5-4.6-9.3-9.4C1.4 7 3.7 4 6.9 4c2 0 3.7 1.1 5.1 3 1.4-1.9 3-3 5.1-3 3.2 0 5.5 3 4.2 6.6C19.5 15.4 12 20 12 20z",
  truck:
    "M1 8h12v8H1zM13 11h4l3 3v2h-7M5.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
}

const btnPrimary =
  "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2"

const btnSecondary =
  "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:border-muted-foreground/40 hover:bg-accent focus-visible:outline-2"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Icon d={ICONS.chain} className="size-4" />
              </span>
              <span className="hidden text-sm font-semibold tracking-tight whitespace-nowrap text-foreground min-[420px]:block">
                Data Integrity Ledger
              </span>
            </a>
            <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <a
                href="#products"
                className="transition-colors hover:text-foreground"
              >
                Products
              </a>
              <a
                href="#verification"
                className="transition-colors hover:text-foreground"
              >
                Verification
              </a>
              <a href="#tamper" className="transition-colors hover:text-foreground">
                Tamper Demo
              </a>
              <a href="/applications" className="transition-colors hover:text-foreground">
                Applications
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/verify" className={`${btnSecondary} max-sm:hidden`}>
              Run Verification
            </a>
            <a href="/dashboard" className={btnPrimary}>
              Open Dashboard
            </a>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-200px] left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.15]"
          style={{
            background:
              "radial-gradient(closest-side, var(--primary) 0%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-16 text-center md:px-8 md:pt-28 md:pb-20">
          <a
            href="#tamper"
            className="rise inline-flex items-center gap-2 rounded-full border border-border bg-popover py-1 pr-3 pl-1 text-xs text-foreground transition-colors hover:border-primary/40"
          >
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary">
              New
            </span>
            Append-only grade corrections are live
            <Icon d={ICONS.arrow} className="size-3.5 text-muted-foreground" />
          </a>

          <h1
            className="rise mx-auto mt-6 max-w-3xl text-4xl leading-[1.05] font-medium tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Grades written once.
            <br />
            <span className="text-muted-foreground/50">Proven forever.</span>
          </h1>

          <p
            className="rise mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            The tamper-evident grade platform. Every record is sealed with a
            SHA-256 content hash, chained to its predecessor, and signed with
            the faculty member&apos;s RSA-2048 key — so a silent database edit
            breaks the chain, and the break is provable.
          </p>

          <div
            className="rise mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <a href="/dashboard" className={btnPrimary}>
              Open Dashboard
              <Icon d={ICONS.arrow} className="size-4" />
            </a>
            <a href="#verification" className={btnSecondary}>
              See full verification
            </a>
          </div>

          {/* Dashboard mock — the product screenshot slot, authored in HTML */}
          <div
            className="rise relative mx-auto mt-16 max-w-5xl"
            style={{ animationDelay: "320ms" }}
          >
            <div
              aria-hidden
              className="absolute inset-x-8 -top-8 h-40 rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(closest-side, var(--primary) 0%, transparent 100%)",
              }}
            />
            <div className="relative overflow-hidden rounded-lg border border-border bg-card text-left shadow-2xl shadow-black/60">
              {/* window chrome */}
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-border" />
                <span className="size-2.5 rounded-full bg-border" />
                <span className="size-2.5 rounded-full bg-border" />
                <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                  diledger.app/dashboard
                </span>
              </div>
              <div className="grid grid-cols-[180px_1fr] max-md:grid-cols-1">
                {/* sidebar */}
                <div className="hidden border-r border-border p-4 max-md:hidden md:block">
                  <div className="space-y-1 text-[13px]">
                    {[
                      ["Overview", true],
                      ["Grade Records", false],
                      ["Verify Ledger", false],
                      ["Audit Trail", false],
                    ].map(([label, active]) => (
                      <div
                        key={label as string}
                        className={`rounded-md px-2.5 py-1.5 ${
                          active
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-border pt-4">
                    <p className="px-2.5 font-mono text-[10px] tracking-widest text-muted-foreground/50 uppercase">
                      Chain health
                    </p>
                    <p className="mt-2 px-2.5 text-2xl font-semibold text-foreground">
                      100%
                    </p>
                    <p className="mt-1 px-2.5 text-[11px] text-primary">
                      All blocks verified
                    </p>
                  </div>
                </div>
                {/* main */}
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["Total records", "8"],
                      ["Chain status", "Verified"],
                      ["Flagged entries", "0"],
                      ["Registered signers", "3"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-md border border-border bg-popover p-3"
                      >
                        <p className="text-[11px] text-muted-foreground">{label}</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 overflow-hidden rounded-md border border-border">
                    <table className="w-full text-left text-[12px]">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 text-[10px] tracking-wider text-muted-foreground uppercase">
                          <th className="px-3 py-2 font-medium">Block</th>
                          <th className="px-3 py-2 font-medium">Student</th>
                          <th className="hidden px-3 py-2 font-medium sm:table-cell">
                            Course
                          </th>
                          <th className="px-3 py-2 font-medium">Grade</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {[
                          ["#1", "Rafiq Ahmed", "CSE 323", "B+", true],
                          ["#2", "Nusrat Jahan", "CSE 315", "A", true],
                          ["#3", "Tanvir Islam", "CSE 208", "A-", true],
                          ["#4", "Farhana Akter", "CSE 323", "B", true],
                        ].map(([n, student, course, grade, ok]) => (
                          <tr key={n as string}>
                            <td className="px-3 py-2 font-mono text-muted-foreground">
                              {n}
                            </td>
                            <td className="px-3 py-2 text-foreground">{student}</td>
                            <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">
                              {course}
                            </td>
                            <td className="px-3 py-2 font-mono font-semibold text-foreground">
                              {grade}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                  ok
                                    ? "bg-primary/10 text-primary"
                                    : "bg-destructive/10 text-destructive"
                                }`}
                              >
                                <Icon
                                  d={ok ? ICONS.check : ICONS.x}
                                  className="size-2.5"
                                />
                                {ok ? "VERIFIED" : "FLAGGED"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Standards strip ── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-6 font-mono text-xs text-muted-foreground md:px-8">
          <span className="text-muted-foreground/50">Built on open standards:</span>
          {[
            "SHA-256",
            "RSA-2048",
            "node:crypto",
            "PostgreSQL",
            "Next.js",
            "Prisma",
          ].map((s) => (
            <span key={s} className="font-medium tracking-wide">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ── Products: feature cards with live-looking panels ── */}
      <section
        id="products"
        className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24"
      >
        <p className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
          Products
        </p>
        <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
          A complete integrity stack for academic records
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {/* Ledger Database */}
          <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-muted-foreground/40">
            <div className="p-6 pb-4">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon d={ICONS.database} className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Ledger Database
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every grade is a block: a deterministic canonical payload,
                reduced to SHA-256, storing its predecessor&apos;s digest.
                Rewriting one block invalidates every block after it.
              </p>
            </div>
            <pre className="mt-auto border-t border-border bg-background p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
              <code>{`{
  "block_index": 2,
  "course_id": "course-cse323",
  "created_at": "2026-08-01T10:32:00Z",
  "grade": "B+",
  "prev_hash": "5f2a8eb1fdc3…89a2b",
  "signed_by": "fac-mamun-001",
  "student_id": "std-001"
}`}</code>
            </pre>
          </div>

          {/* Faculty Signing */}
          <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-muted-foreground/40">
            <div className="p-6 pb-4">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon d={ICONS.key} className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Faculty Signing
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Each faculty signer holds an RSA-2048 key pair. Private keys
                never leave the server; every digest is signed server-side and
                verifiable against the registered public key.
              </p>
            </div>
            <div className="mt-auto border-t border-border bg-background p-4 font-mono text-[11px] leading-relaxed">
              <p className="text-muted-foreground/50">
                # signature = RSA_SIGN(priv, record_hash)
              </p>
              <p className="mt-1 text-primary">
                RSA_VERIFY(pub, record_hash, signature) →{" "}
                <span className="font-bold">VALID</span>
              </p>
            </div>
          </div>

          {/* Full Verification */}
          <div
            id="verification"
            className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-muted-foreground/40"
          >
            <div className="p-6 pb-4">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon d={ICONS.shield} className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Full Ledger Verification
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                One click replays the entire chain: recomputes every hash,
                checks every link, verifies every signature — and names the
                exact block and failed check when anything is off.
              </p>
            </div>
            <div className="mt-auto border-t border-border bg-background p-4 font-mono text-[11px] leading-relaxed">
              <p className="text-muted-foreground/50">$ POST /api/verification</p>
              <p className="mt-1">
                <span className="text-primary">✓</span> hash_valid{" "}
                <span className="text-primary">✓</span> chain_valid{" "}
                <span className="text-primary">✓</span> signature_valid
              </p>
              <p className="mt-1 font-bold text-primary">
                → STATUS: VERIFIED · 8/8 blocks authentic
              </p>
            </div>
          </div>

          {/* Tamper Detection */}
          <div
            id="tamper"
            className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-destructive/30"
          >
            <div className="p-6 pb-4">
              <span className="flex size-9 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <Icon d={ICONS.zap} className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Tampering Detection
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A direct SQL edit — the attack this system assumes — no longer
                hides. The stored digest no longer matches the payload, and
                verification flags the record for every later block to see.
              </p>
            </div>
            <div className="mt-auto border-t border-border bg-background p-4 font-mono text-[11px] leading-relaxed">
              <p>
                <span className="text-muted-foreground">stored grade:</span>{" "}
                <span className="line-through">B+</span>{" "}
                <span className="text-muted-foreground">· db value:</span>{" "}
                <span className="font-bold text-destructive">A+</span>
              </p>
              <p className="mt-1 text-destructive">
                ✗ hash mismatch · ✗ signature invalid · FLAGGED
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works: chain strip ── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <p className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
                How the evidence works
              </p>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
                Trust is not asserted. It is recomputed.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Each block stores its predecessor&apos;s digest. Recompute any
                record and the mismatch propagates to every later block — the
                chain speaks for itself, no auditor required.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  [
                    ICONS.lock,
                    "Canonical serialization",
                    "Identical content always produces an identical byte representation before hashing (NFR-03).",
                  ],
                  [
                    ICONS.chain,
                    "Sequential hash chaining",
                    "prev_hash → record_hash links every block to its predecessor, genesis to head.",
                  ],
                  [
                    ICONS.eye,
                    "Server-side verification",
                    "Authorization and signing happen exclusively on the server; keys never reach the browser.",
                  ],
                ].map(([icon, title, body]) => (
                  <li key={title as string} className="flex gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon d={icon as string} className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* live chain strip */}
            <figure className="overflow-hidden rounded-lg border border-border bg-background">
              <figcaption className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="font-mono text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                  Hash chain · demo dataset
                </span>
                <span className="font-mono text-[11px] text-primary">
                  sha256
                </span>
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
                      <span className="truncate text-muted-foreground">
                        {short(row.prev)}
                      </span>
                      <span className="text-muted-foreground/50">hash</span>
                      <span className="truncate text-primary">
                        {short(row.hash)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground/50">
                Illustrative demo data · live verification recomputes every
                block at /verify
              </p>
            </figure>
          </div>
        </div>
      </section>

      {/* ── Honest limits ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
              Honest limits
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
              Tamper-evident is not tamper-proof.
            </h2>
          </div>
          <ul className="divide-y divide-border/50 rounded-lg border border-border bg-card">
            {[
              "Detection happens after the fact — a determined attacker with database access can still change a grade; they just cannot make it look authentic.",
              "Signature verification assumes key custody — a compromised faculty private key can produce valid-looking records.",
              "A rollback that rewrites the full chain consistently is detectable only against external anchors such as exports or printed transcripts.",
            ].map((limit) => (
              <li
                key={limit}
                className="flex gap-3 px-5 py-4 text-sm leading-relaxed text-muted-foreground"
              >
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                />
                {limit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Beyond grades: applications teaser ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <p className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
              Beyond grades
            </p>
            <h2 className="mt-3 max-w-md text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
              The same seal works on more than grades.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Nothing in the chain knows what a grade is. Swap the payload and
              the identical hash-link-sign-verify machinery protects transcripts,
              research data, medical records, supply chains, and land registries.
            </p>
            <a
              href="/applications"
              className={`${btnSecondary} mt-8`}
            >
              Explore all applications
              <Icon d={ICONS.arrow} className="size-4" />
            </a>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              [ICONS.scroll, "Transcripts & degrees", "Re-provable years after issuance"],
              [ICONS.flask, "Research data", "Lab results timestamped into the chain"],
              [ICONS.heart, "Medical records", "Clinician-signed patient histories"],
              [ICONS.truck, "Supply chains", "Custody provenance that breaks when forged"],
            ].map(([icon, title, body]) => (
              <li
                key={title as string}
                className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30"
              >
                <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon d={icon as string} className="size-4" />
                </span>
                <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </li>
            ))}
          </ul>
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
            Open the ledger. Run your first verification.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            The seeded demo dataset, the tamper simulation, and the full
            verification runner are one click away.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="/dashboard" className={btnPrimary}>
              Open Dashboard
              <Icon d={ICONS.arrow} className="size-4" />
            </a>
            <a href="/verify" className={btnSecondary}>
              Run Full Verification
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-4 md:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Icon d={ICONS.chain} className="size-4" />
              </span>
              <span className="text-sm font-semibold text-foreground">
                Data Integrity Ledger
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Tamper-evident academic grade records. Detection over prevention,
              evidence over assertion.
            </p>
          </div>
          {[
            [
              "Product",
              [
                ["Dashboard", "/dashboard"],
                ["Grade Records", "/records"],
                ["Verify Ledger", "/verify"],
              ],
            ],
            [
              "Cryptography",
              [
                ["SHA-256 hashing", "#products"],
                ["RSA-2048 signing", "#products"],
                ["Hash chaining", "#verification"],
              ],
            ],
            [
              "Project",
              [
                ["Applications beyond grades", "/applications"],
                ["SRS specification", "#"],
                ["Honest limits", "#tamper"],
                ["Course project MVP", "#"],
              ],
            ],
          ].map(([title, links]) => (
            <div key={title as string}>
              <p className="font-mono text-[11px] font-medium tracking-widest text-muted-foreground/50 uppercase">
                {title}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {(links as Array<[string, string]>).map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-4 font-mono text-[11px] text-muted-foreground/50 md:px-8">
            <span>Data Integrity Ledger · course project MVP</span>
            <span>SHA-256 · RSA-2048 · node:crypto</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
