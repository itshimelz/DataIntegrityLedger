// ponytail: reactive in-memory state store for MVP demo, simulating database and ledger services

import {
  computeRecordHash,
  DEMO_FACULTY_KEYS,
  GENESIS_HASH,
  signHash,
  verifySignature,
} from "../crypto"
import type {
  AuditEvent,
  CanonicalRecordPayload,
  Course,
  FacultyUser,
  GradeRecord,
  LedgerVerificationReport,
  Student,
  VerificationResult,
  VerificationStatus,
} from "../types"
import {
  buildInitialChain,
  INITIAL_COURSES,
  INITIAL_FACULTY,
  INITIAL_STUDENTS,
} from "./data"

class LedgerStore {
  private faculty: FacultyUser[] = []
  private courses: Course[] = []
  private students: Student[] = []
  private gradeRecords: GradeRecord[] = []
  private auditEvents: AuditEvent[] = []

  constructor() {
    this.resetDemoData()
  }

  /**
   * Resets in-memory state back to the initial pristine seed data.
   */
  public resetDemoData(): void {
    // Deep clone initial seed data
    this.faculty = JSON.parse(JSON.stringify(INITIAL_FACULTY))
    this.courses = JSON.parse(JSON.stringify(INITIAL_COURSES))
    this.students = JSON.parse(JSON.stringify(INITIAL_STUDENTS))
    this.gradeRecords = buildInitialChain()
    this.auditEvents = [
      {
        id: "evt-init-001",
        actor_id: "SYSTEM",
        action: "VERIFICATION_RUN",
        metadata: { info: "Initial ledger genesis seed loaded" },
        created_at: new Date().toISOString(),
      },
    ]
  }

  // --- Getters ---

  public getGradeRecords(): GradeRecord[] {
    return [...this.gradeRecords].sort((a, b) => a.block_index - b.block_index)
  }

  public getGradeRecordById(id: string): GradeRecord | undefined {
    return this.gradeRecords.find((r) => r.id === id)
  }

  public getStudents(): Student[] {
    return [...this.students]
  }

  public getStudentById(id: string): Student | undefined {
    return this.students.find((s) => s.id === id || s.student_id === id)
  }

  public getCourses(): Course[] {
    return [...this.courses]
  }

  public getCourseById(id: string): Course | undefined {
    return this.courses.find((c) => c.id === id || c.course_code === id)
  }

  public getFaculty(): FacultyUser[] {
    return [...this.faculty]
  }

  public getFacultyById(id: string): FacultyUser | undefined {
    return this.faculty.find((f) => f.id === id)
  }

  public getAuditEvents(): AuditEvent[] {
    return [...this.auditEvents].reverse()
  }

  // --- Mutation & Ledger Operations ---

  /**
   * Appends a new authenticated grade record to the ledger chain.
   * Computes next block_index, prev_hash, canonical SHA-256 hash, and RSA-2048 signature.
   */
  public addGradeRecord(params: {
    student_id: string
    course_id: string
    grade: string
    faculty_id: string
    created_at?: string
  }): GradeRecord {
    const faculty = this.getFacultyById(params.faculty_id)
    if (!faculty) {
      throw new Error(`Faculty not found: ${params.faculty_id}`)
    }

    const privateKey =
      faculty.private_key || DEMO_FACULTY_KEYS[params.faculty_id]?.privateKey
    if (!privateKey) {
      throw new Error(
        `Signing private key missing for faculty: ${params.faculty_id}`
      )
    }

    const sorted = this.getGradeRecords()
    const lastRecord = sorted[sorted.length - 1]

    const block_index = lastRecord ? lastRecord.block_index + 1 : 1
    const prev_hash = lastRecord ? lastRecord.record_hash : GENESIS_HASH
    const id = `GR-${String(block_index).padStart(6, "0")}`
    const created_at = params.created_at || new Date().toISOString()

    const payload: CanonicalRecordPayload = {
      id,
      student_id: params.student_id,
      course_id: params.course_id,
      grade: params.grade,
      block_index,
      prev_hash,
      signed_by: params.faculty_id,
      created_at,
    }

    const record_hash = computeRecordHash(payload)
    const signature = signHash(record_hash, privateKey)

    const record: GradeRecord = {
      id,
      student_id: params.student_id,
      course_id: params.course_id,
      grade: params.grade,
      block_index,
      prev_hash,
      record_hash,
      signature,
      signed_by: params.faculty_id,
      created_at,
    }

    this.gradeRecords.push(record)

    this.auditEvents.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      actor_id: params.faculty_id,
      action: "GRADE_CREATED",
      target_record_id: id,
      metadata: {
        block_index,
        student_id: params.student_id,
        course_id: params.course_id,
        grade: params.grade,
      },
      created_at: new Date().toISOString(),
    })

    return record
  }

  /**
   * FR-07 Grade Editing: appends a new signed ledger block that corrects an
   * earlier record's grade. The original block is never mutated — evidence of
   * the original authenticated entry stays preserved in the chain.
   */
  public correctGradeRecord(params: {
    record_id: string
    new_grade: string
    faculty_id: string
  }): GradeRecord {
    const original = this.getGradeRecordById(params.record_id)
    if (!original) {
      throw new Error(`Grade record not found: ${params.record_id}`)
    }
    if (original.grade === params.new_grade) {
      throw new Error(
        `New grade must differ from the current recorded grade (${original.grade})`
      )
    }

    const faculty = this.getFacultyById(params.faculty_id)
    if (!faculty) {
      throw new Error(`Faculty not found: ${params.faculty_id}`)
    }
    const privateKey =
      faculty.private_key || DEMO_FACULTY_KEYS[params.faculty_id]?.privateKey
    if (!privateKey) {
      throw new Error(
        `Signing private key missing for faculty: ${params.faculty_id}`
      )
    }

    // Chain onto the current head like any other append
    const sorted = this.getGradeRecords()
    const lastRecord = sorted[sorted.length - 1]
    const block_index = lastRecord ? lastRecord.block_index + 1 : 1
    const prev_hash = lastRecord ? lastRecord.record_hash : GENESIS_HASH
    const id = `GR-${String(block_index).padStart(6, "0")}`
    const created_at = new Date().toISOString()

    const payload: CanonicalRecordPayload = {
      id,
      student_id: original.student_id,
      course_id: original.course_id,
      grade: params.new_grade,
      block_index,
      prev_hash,
      signed_by: params.faculty_id,
      created_at,
      corrects_record_id: original.id,
    }

    const record_hash = computeRecordHash(payload)
    const signature = signHash(record_hash, privateKey)

    const record: GradeRecord = {
      id,
      student_id: original.student_id,
      course_id: original.course_id,
      grade: params.new_grade,
      block_index,
      prev_hash,
      record_hash,
      signature,
      signed_by: params.faculty_id,
      created_at,
      corrects_record_id: original.id,
    }

    this.gradeRecords.push(record)

    this.auditEvents.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      actor_id: params.faculty_id,
      action: "GRADE_CORRECTED",
      target_record_id: id,
      metadata: {
        block_index,
        corrects_record_id: original.id,
        previous_grade: original.grade,
        corrected_grade: params.new_grade,
        student_id: original.student_id,
        course_id: original.course_id,
      },
      created_at: new Date().toISOString(),
    })

    return record
  }

  /**
   * Controlled tampering simulation (SRS FR-14):
   * Modifies the stored database grade value without updating the canonical hash or signature.
   */
  public tamperRecord(
    recordIdOrStudentName: string,
    newGrade: string
  ): {
    success: boolean
    record?: GradeRecord
    previousGrade?: string
    error?: string
  } {
    // Locate record by ID or by matching student name/id
    let target = this.gradeRecords.find((r) => r.id === recordIdOrStudentName)

    if (!target) {
      const student = this.students.find(
        (s) =>
          s.name.toLowerCase().includes(recordIdOrStudentName.toLowerCase()) ||
          s.student_id === recordIdOrStudentName
      )
      if (student) {
        target = this.gradeRecords.find((r) => r.student_id === student.id)
      }
    }

    if (!target) {
      return {
        success: false,
        error: `Target grade record not found for query: "${recordIdOrStudentName}"`,
      }
    }

    const previousGrade = target.grade
    // ponytail: simulate unauthorized DB modification by mutating grade in-place without touching crypto
    target.grade = newGrade

    this.auditEvents.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      actor_id: "UNAUTHORIZED_SIMULATION",
      action: "TAMPER_DETECTED",
      target_record_id: target.id,
      metadata: {
        info: "Simulated unauthorized direct database modification",
        previousGrade,
        tamperedGrade: newGrade,
      },
      created_at: new Date().toISOString(),
    })

    return {
      success: true,
      record: target,
      previousGrade,
    }
  }

  /**
   * Full Ledger Verification (SRS FR-12):
   * Iterates through the entire chain and checks:
   * 1. Content Hash recomputation (SHA-256 match)
   * 2. Sequential Hash Chain linkage (prev_hash match)
   * 3. RSA-2048 Digital Signature authenticity against faculty public key
   */
  public verifyLedger(): LedgerVerificationReport {
    const records = this.getGradeRecords()
    const facultyMap = new Map(this.faculty.map((f) => [f.id, f]))

    const issues: VerificationResult[] = []
    let validCount = 0
    let invalidCount = 0

    for (let i = 0; i < records.length; i++) {
      const record = records[i]

      // A. Recompute canonical payload and hash
      const payload: CanonicalRecordPayload = {
        id: record.id,
        student_id: record.student_id,
        course_id: record.course_id,
        grade: record.grade,
        block_index: record.block_index,
        prev_hash: record.prev_hash,
        signed_by: record.signed_by,
        created_at: record.created_at,
      }
      if (record.corrects_record_id !== undefined) {
        payload.corrects_record_id = record.corrects_record_id
      }

      const recomputedHash = computeRecordHash(payload)
      const hash_valid = recomputedHash === record.record_hash

      // B. Verify sequential chain linkage
      let chain_valid = false
      if (i === 0) {
        chain_valid =
          record.prev_hash === GENESIS_HASH && record.block_index === 1
      } else {
        const prevRecord = records[i - 1]
        chain_valid =
          record.prev_hash === prevRecord.record_hash &&
          record.block_index === prevRecord.block_index + 1
      }

      // C. Verify RSA-2048 digital signature
      const faculty = facultyMap.get(record.signed_by)
      const signature_valid = faculty
        ? verifySignature(
            record.record_hash,
            record.signature,
            faculty.public_key
          )
        : false

      const isRecordValid = hash_valid && chain_valid && signature_valid
      const status: VerificationStatus = isRecordValid ? "VERIFIED" : "FLAGGED"

      if (isRecordValid) {
        validCount++
      } else {
        invalidCount++
      }

      const errors: string[] = []
      if (!hash_valid) {
        errors.push(
          "Content hash mismatch: stored hash does not match current payload"
        )
      }
      if (!chain_valid) {
        errors.push(
          `Broken chain linkage: prev_hash does not match preceding block's hash`
        )
      }
      if (!signature_valid) {
        errors.push(
          "Invalid digital signature: RSA verification failed against signer public key"
        )
      }

      issues.push({
        record_id: record.id,
        block_index: record.block_index,
        hash_valid,
        chain_valid,
        signature_valid,
        status,
        error: errors.length > 0 ? errors.join(" | ") : undefined,
      })
    }

    const overallStatus: VerificationStatus =
      invalidCount === 0 ? "VERIFIED" : "FLAGGED"

    const report: LedgerVerificationReport = {
      status: overallStatus,
      total: records.length,
      valid: validCount,
      invalid: invalidCount,
      issues,
      verified_at: new Date().toISOString(),
    }

    this.auditEvents.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      actor_id: "SYSTEM",
      action: "VERIFICATION_RUN",
      metadata: {
        total: records.length,
        valid: validCount,
        invalid: invalidCount,
        status: overallStatus,
      },
      created_at: new Date().toISOString(),
    })

    return report
  }
}

// ponytail: singleton demo store instance shared across server actions / handlers
export const demoStore = new LedgerStore()
