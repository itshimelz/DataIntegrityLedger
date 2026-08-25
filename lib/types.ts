// ponytail: minimal clean type definitions for Data Integrity Ledger MVP without unneeded layers

export type Role = "FACULTY" | "REGISTRAR" | "ADMIN"

export type VerificationStatus = "VERIFIED" | "FLAGGED" | "PENDING"

export type AuditAction =
  "GRADE_CREATED" | "GRADE_CORRECTED" | "VERIFICATION_RUN" | "TAMPER_DETECTED"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  public_key: string
  created_at: string
  updated_at?: string
}

export interface FacultyUser extends User {
  role: "FACULTY"
  private_key?: string // ponytail: kept in server demo context only, never sent to clients
}

export interface Student {
  id: string
  student_id: string
  name: string
  department: string
  created_at: string
  updated_at?: string
}

export interface Course {
  id: string
  course_code: string
  course_name: string
  created_at: string
  updated_at?: string
}

export interface GradeRecord {
  id: string
  student_id: string
  course_id: string
  grade: string
  block_index: number
  prev_hash: string
  record_hash: string
  signature: string
  signed_by: string // Faculty User ID
  created_at: string
  corrects_record_id?: string // FR-07: set when this block appends a correction to an earlier record
}

export interface AuditEvent {
  id: string
  actor_id: string
  action: AuditAction
  target_record_id?: string
  metadata?: Record<string, unknown> | string
  created_at: string
}

/**
 * Deterministic payload used to compute the record's SHA-256 hash.
 * NFR-03: Deterministic canonical serialization.
 */
export interface CanonicalRecordPayload {
  id: string
  student_id: string
  course_id: string
  grade: string
  block_index: number
  prev_hash: string
  signed_by: string
  created_at: string
  corrects_record_id?: string
}

export interface VerificationResult {
  record_id: string
  block_index: number
  hash_valid: boolean
  chain_valid: boolean
  signature_valid: boolean
  status: VerificationStatus
  error?: string
}

export interface LedgerVerificationReport {
  status: VerificationStatus
  total: number
  valid: number
  invalid: number
  issues: VerificationResult[]
  verified_at: string
}

export interface KeyPair {
  publicKey: string
  privateKey: string
}
