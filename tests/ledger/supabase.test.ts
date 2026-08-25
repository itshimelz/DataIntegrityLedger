import { describe, expect, it } from "bun:test"
import { FACULTY_ID_SHARIFUR } from "../../lib/crypto"
import { supabaseLedger } from "../../lib/supabase/ledger"

const hasSupabase =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )

describe.skipIf(!hasSupabase)("SupabaseLedgerService", () => {
  it("fetches initial seed records and runs verification on Supabase", async () => {
    await supabaseLedger.resetDemoData()
    const records = await supabaseLedger.getGradeRecords()
    expect(records.length).toBe(8)
    expect(records[0].block_index).toBe(1)

    const report = await supabaseLedger.verifyLedger()
    expect(report.total).toBe(8)
    expect(report.status).toBe("VERIFIED")
    expect(report.invalid).toBe(0)
  })

  it("appends a new signed grade record to Supabase and maintains integrity", async () => {
    const newRecord = await supabaseLedger.addGradeRecord({
      student_id: "std-001",
      course_id: "course-cse208",
      grade: "A",
      faculty_id: FACULTY_ID_SHARIFUR,
    })

    expect(newRecord.block_index).toBe(9)
    expect(newRecord.prev_hash).toBeDefined()
    expect(newRecord.record_hash).toBeDefined()
    expect(newRecord.signature).toBeDefined()

    const records = await supabaseLedger.getGradeRecords()
    expect(records.length).toBe(9)

    const report = await supabaseLedger.verifyLedger()
    expect(report.total).toBe(9)
    expect(report.status).toBe("VERIFIED")
  })

  it("appends a signed grade correction to Supabase without mutating original block", async () => {
    const records = await supabaseLedger.getGradeRecords()
    const target = records[0]

    const corrected = await supabaseLedger.correctGradeRecord({
      record_id: target.id,
      new_grade: "A+",
      faculty_id: FACULTY_ID_SHARIFUR,
    })

    expect(corrected.block_index).toBe(10)
    expect(corrected.corrects_record_id).toBe(target.id)

    // Original block remains unchanged in Supabase
    const originalInDb = await supabaseLedger.getGradeRecordById(target.id)
    expect(originalInDb?.grade).toBe(target.grade)

    const report = await supabaseLedger.verifyLedger()
    expect(report.status).toBe("VERIFIED")
  })

  it("detects tampering when database record is directly modified in Supabase", async () => {
    const tamperResult = await supabaseLedger.tamperRecord("std-002", "F")
    expect(tamperResult.success).toBe(true)

    const report = await supabaseLedger.verifyLedger()
    expect(report.status).toBe("FLAGGED")
    expect(report.invalid).toBeGreaterThanOrEqual(1)

    // Reset clean state
    await supabaseLedger.resetDemoData()
    const cleanReport = await supabaseLedger.verifyLedger()
    expect(cleanReport.status).toBe("VERIFIED")
    expect(cleanReport.total).toBe(8)
  })
})
