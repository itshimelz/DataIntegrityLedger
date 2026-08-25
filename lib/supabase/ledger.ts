import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import {
  computeRecordHash,
  DEMO_FACULTY_KEYS,
  GENESIS_HASH,
  signHash,
  verifySignature,
} from "../crypto"
import {
  buildInitialChain,
  INITIAL_COURSES,
  INITIAL_FACULTY,
  INITIAL_STUDENTS,
} from "../demo/data"
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
import type { Database } from "./database.types"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in environment variables"
    )
  }

  return createSupabaseClient<Database>(url, key)
}

export class SupabaseLedgerService {
  /**
   * Fetches all grade records from Supabase, sorted by block_index ascending.
   */
  public async getGradeRecords(): Promise<GradeRecord[]> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("grade_records")
      .select("*")
      .order("block_index", { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch grade records: ${error.message}`)
    }

    return (data || []).map((r) => ({
      id: r.id,
      student_id: r.student_id,
      course_id: r.course_id,
      grade: r.grade,
      block_index: r.block_index,
      prev_hash: r.prev_hash,
      record_hash: r.record_hash,
      signature: r.signature,
      signed_by: r.signed_by,
      created_at: r.created_at,
      corrects_record_id: r.corrects_record_id || undefined,
    }))
  }

  public async getGradeRecordById(id: string): Promise<GradeRecord | undefined> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("grade_records")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return undefined

    return {
      id: data.id,
      student_id: data.student_id,
      course_id: data.course_id,
      grade: data.grade,
      block_index: data.block_index,
      prev_hash: data.prev_hash,
      record_hash: data.record_hash,
      signature: data.signature,
      signed_by: data.signed_by,
      created_at: data.created_at,
      corrects_record_id: data.corrects_record_id || undefined,
    }
  }

  public async getStudents(): Promise<Student[]> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("student_id", { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch students: ${error.message}`)
    }

    return (data || []).map((s) => ({
      id: s.id,
      student_id: s.student_id,
      name: s.name,
      department: s.department,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }))
  }

  public async getCourses(): Promise<Course[]> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("course_code", { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`)
    }

    return (data || []).map((c) => ({
      id: c.id,
      course_code: c.course_code,
      course_name: c.course_name,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }))
  }

  public async getFaculty(): Promise<FacultyUser[]> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "FACULTY")

    if (error) {
      throw new Error(`Failed to fetch faculty users: ${error.message}`)
    }

    return (data || []).map((f) => ({
      id: f.id,
      name: f.name,
      email: f.email,
      role: "FACULTY",
      public_key: f.public_key,
      private_key: DEMO_FACULTY_KEYS[f.id]?.privateKey,
      created_at: f.created_at,
      updated_at: f.updated_at,
    }))
  }

  public async getAuditEvents(): Promise<AuditEvent[]> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("audit_events")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch audit events: ${error.message}`)
    }

    return (data || []).map((e) => ({
      id: e.id,
      actor_id: e.actor_id,
      action: e.action as AuditEvent["action"],
      target_record_id: e.target_record_id || undefined,
      metadata: (e.metadata as Record<string, unknown>) || undefined,
      created_at: e.created_at,
    }))
  }

  /**
   * Appends a new authenticated grade record to the ledger in Supabase.
   */
  public async addGradeRecord(params: {
    student_id: string
    course_id: string
    grade: string
    faculty_id: string
    created_at?: string
    /** Registered-faculty path: resolved + decrypted server-side in the route (never from the client) */
    signer_private_key?: string
  }): Promise<GradeRecord> {
    const supabase = getSupabase()

    // 1. Get faculty signing keys
    let faculty = (await this.getFaculty()).find((f) => f.id === params.faculty_id)
    if (!faculty) {
      const { data: userRow } = await supabase
        .from("users")
        .select("*")
        .eq("id", params.faculty_id)
        .maybeSingle()
      if (userRow) {
        faculty = {
          id: userRow.id,
          name: userRow.name,
          email: userRow.email,
          role: "FACULTY",
          public_key: userRow.public_key,
          created_at: userRow.created_at,
          updated_at: userRow.updated_at,
        }
      }
    }
    if (!faculty) {
      throw new Error(`Faculty not found: ${params.faculty_id}`)
    }

    const privateKey =
      params.signer_private_key ||
      faculty.private_key ||
      DEMO_FACULTY_KEYS[params.faculty_id]?.privateKey
    if (!privateKey) {
      throw new Error(`Signing private key missing for faculty: ${params.faculty_id}`)
    }

    // 2. Fetch the latest record to get block index & prev_hash
    const { data: latestRecords, error: fetchError } = await supabase
      .from("grade_records")
      .select("*")
      .order("block_index", { ascending: false })
      .limit(1)

    if (fetchError) {
      throw new Error(`Failed to inspect ledger state: ${fetchError.message}`)
    }

    const lastRecord = latestRecords && latestRecords.length > 0 ? latestRecords[0] : null
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

    // 3. Insert grade record into Supabase
    const { error: insertError } = await supabase.from("grade_records").insert({
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
    })

    if (insertError) {
      throw new Error(`Failed to append record to database: ${insertError.message}`)
    }

    // 4. Record audit event in Supabase
    await supabase.from("audit_events").insert({
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

    return {
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
  }

  /**
   * FR-07 Grade Editing: appends a new signed ledger block that corrects an
   * earlier record's grade in Supabase. The original block is never mutated.
   */
  public async correctGradeRecord(params: {
    record_id: string
    new_grade: string
    faculty_id: string
    /** Registered-faculty path: resolved + decrypted server-side in the route (never from the client) */
    signer_private_key?: string
  }): Promise<GradeRecord> {
    const supabase = getSupabase()

    const original = await this.getGradeRecordById(params.record_id)
    if (!original) {
      throw new Error(`Grade record not found: ${params.record_id}`)
    }
    if (original.grade === params.new_grade) {
      throw new Error(
        `New grade must differ from the current recorded grade (${original.grade})`
      )
    }

    let faculty = (await this.getFaculty()).find((f) => f.id === params.faculty_id)
    if (!faculty) {
      const { data: userRow } = await supabase
        .from("users")
        .select("*")
        .eq("id", params.faculty_id)
        .maybeSingle()
      if (userRow) {
        faculty = {
          id: userRow.id,
          name: userRow.name,
          email: userRow.email,
          role: "FACULTY",
          public_key: userRow.public_key,
          created_at: userRow.created_at,
          updated_at: userRow.updated_at,
        }
      }
    }
    if (!faculty) {
      throw new Error(`Faculty not found: ${params.faculty_id}`)
    }

    const privateKey =
      params.signer_private_key ||
      faculty.private_key ||
      DEMO_FACULTY_KEYS[params.faculty_id]?.privateKey
    if (!privateKey) {
      throw new Error(`Signing private key missing for faculty: ${params.faculty_id}`)
    }

    // Chain onto the current head
    const { data: latestRecords, error: fetchError } = await supabase
      .from("grade_records")
      .select("*")
      .order("block_index", { ascending: false })
      .limit(1)

    if (fetchError) {
      throw new Error(`Failed to inspect ledger state: ${fetchError.message}`)
    }

    const lastRecord = latestRecords && latestRecords.length > 0 ? latestRecords[0] : null
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

    const { error: insertError } = await supabase.from("grade_records").insert({
      id,
      student_id: original.student_id,
      course_id: original.course_id,
      grade: params.new_grade,
      block_index,
      prev_hash,
      record_hash,
      signature,
      signed_by: params.faculty_id,
      corrects_record_id: original.id,
      created_at,
    })

    if (insertError) {
      throw new Error(`Failed to append correction to database: ${insertError.message}`)
    }

    await supabase.from("audit_events").insert({
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

    return {
      id,
      student_id: original.student_id,
      course_id: original.course_id,
      grade: params.new_grade,
      block_index,
      prev_hash,
      record_hash,
      signature,
      signed_by: params.faculty_id,
      corrects_record_id: original.id,
      created_at,
    }
  }

  /**
   * Controlled tampering simulation (SRS FR-14):
   * Modifies the stored database grade value without updating the canonical hash or signature.
   */
  public async tamperRecord(
    recordIdOrStudentName: string,
    newGrade: string
  ): Promise<{
    success: boolean
    record?: GradeRecord
    previousGrade?: string
    error?: string
  }> {
    const supabase = getSupabase()
    const records = await this.getGradeRecords()
    const students = await this.getStudents()

    let target = records.find(
      (r) =>
        r.id === recordIdOrStudentName ||
        r.student_id === recordIdOrStudentName
    )

    if (!target) {
      const query = recordIdOrStudentName.toLowerCase()
      const student = students.find(
        (s) =>
          s.id.toLowerCase() === query ||
          s.student_id.toLowerCase() === query ||
          s.name.toLowerCase().includes(query)
      )
      if (student) {
        target = records.find((r) => r.student_id === student.id)
      }
    }

    if (!target) {
      return {
        success: false,
        error: `Target grade record not found for query: "${recordIdOrStudentName}"`,
      }
    }

    const previousGrade = target.grade

    // Direct database modification without updating cryptographic hash or signature
    const { error: updateError } = await supabase
      .from("grade_records")
      .update({ grade: newGrade })
      .eq("id", target.id)

    if (updateError) {
      return {
        success: false,
        error: `Failed to tamper database record: ${updateError.message}`,
      }
    }

    await supabase.from("audit_events").insert({
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

    const updatedRecord: GradeRecord = {
      ...target,
      grade: newGrade,
    }

    return {
      success: true,
      record: updatedRecord,
      previousGrade,
    }
  }

  /**
   * Full Ledger Verification (SRS FR-12):
   * Iterates through the entire Supabase chain and verifies:
   * 1. SHA-256 Content Hash
   * 2. Sequential Hash Chain Linkage
   * 3. RSA-2048 Digital Signature authenticity
   */
  public async verifyLedger(): Promise<LedgerVerificationReport> {
    const supabase = getSupabase()
    const records = await this.getGradeRecords()
    const faculty = await this.getFaculty()
    const facultyMap = new Map(faculty.map((f) => [f.id, f]))

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
      const signer = facultyMap.get(record.signed_by)
      const signature_valid = signer
        ? verifySignature(
            record.record_hash,
            record.signature,
            signer.public_key
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

    await supabase.from("audit_events").insert({
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

  /**
   * Resets Supabase database back to the initial pristine 8-block seed data.
   */
  public async resetDemoData(): Promise<void> {
    const supabase = getSupabase()

    // 1. Clear existing grade records and audit events
    await supabase.from("audit_events").delete().neq("id", "")
    await supabase.from("grade_records").delete().neq("id", "")

    // 2. Ensure entities exist
    for (const faculty of INITIAL_FACULTY) {
      await supabase.from("users").upsert({
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        public_key: faculty.public_key,
        created_at: faculty.created_at,
      })
    }

    for (const course of INITIAL_COURSES) {
      await supabase.from("courses").upsert({
        id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        created_at: course.created_at,
      })
    }

    for (const student of INITIAL_STUDENTS) {
      await supabase.from("students").upsert({
        id: student.id,
        student_id: student.student_id,
        name: student.name,
        department: student.department,
        created_at: student.created_at,
      })
    }

    // 3. Re-insert initial 8 grade records
    const chain = buildInitialChain()
    for (const record of chain) {
      await supabase.from("grade_records").insert({
        id: record.id,
        student_id: record.student_id,
        course_id: record.course_id,
        grade: record.grade,
        block_index: record.block_index,
        prev_hash: record.prev_hash,
        record_hash: record.record_hash,
        signature: record.signature,
        signed_by: record.signed_by,
        created_at: record.created_at,
      })
    }

    // 4. Re-insert initial audit events
    for (const record of chain) {
      await supabase.from("audit_events").insert({
        id: `audit-${record.id}`,
        actor_id: record.signed_by,
        action: "GRADE_CREATED",
        target_record_id: record.id,
        metadata: {
          block_index: record.block_index,
          student_id: record.student_id,
          course_id: record.course_id,
          grade: record.grade,
        },
        created_at: record.created_at,
      })
    }
  }
}

export const supabaseLedger = new SupabaseLedgerService()
