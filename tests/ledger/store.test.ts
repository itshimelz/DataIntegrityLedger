import { beforeEach, describe, expect, it } from "bun:test"
import { demoStore, FACULTY_ID_SHARIFUR, GENESIS_HASH } from "../../lib"

describe("LedgerStore & Demo Flow", () => {
  beforeEach(() => {
    demoStore.resetDemoData()
  })

  it("initializes with seed data and a 100% verified ledger chain", () => {
    const records = demoStore.getGradeRecords()
    expect(records.length).toBe(8)

    // Block 1 should link to GENESIS_HASH
    expect(records[0].block_index).toBe(1)
    expect(records[0].prev_hash).toBe(GENESIS_HASH)

    // Block 2 should link to Block 1 hash
    expect(records[1].block_index).toBe(2)
    expect(records[1].prev_hash).toBe(records[0].record_hash)

    const report = demoStore.verifyLedger()
    expect(report.status).toBe("VERIFIED")
    expect(report.total).toBe(8)
    expect(report.valid).toBe(8)
    expect(report.invalid).toBe(0)
    expect(report.issues.every((issue) => issue.status === "VERIFIED")).toBe(
      true
    )
  })

  it("successfully appends a new signed grade record to the chain", () => {
    const initialRecords = demoStore.getGradeRecords()
    const lastInitialRecord = initialRecords[initialRecords.length - 1]

    const newRecord = demoStore.addGradeRecord({
      student_id: "std-001",
      course_id: "course-cse208",
      grade: "A",
      faculty_id: FACULTY_ID_SHARIFUR,
    })

    expect(newRecord.block_index).toBe(9)
    expect(newRecord.prev_hash).toBe(lastInitialRecord.record_hash)
    expect(newRecord.signed_by).toBe(FACULTY_ID_SHARIFUR)
    expect(demoStore.getGradeRecords().length).toBe(9)

    // Verify full ledger remains 100% valid
    const report = demoStore.verifyLedger()
    expect(report.status).toBe("VERIFIED")
    expect(report.total).toBe(9)
    expect(report.valid).toBe(9)
    expect(report.invalid).toBe(0)
  })

  it("detects unauthorized tampering with grade value", () => {
    // Tamper Rafiq Ahmed's grade from B+ to A+
    const tamperResult = demoStore.tamperRecord("Rafiq Ahmed", "A+")
    expect(tamperResult.success).toBe(true)
    expect(tamperResult.previousGrade).toBe("B+")

    // Run verification
    const report = demoStore.verifyLedger()
    expect(report.status).toBe("FLAGGED")
    expect(report.invalid).toBeGreaterThanOrEqual(1)

    const tamperedIssue = report.issues.find(
      (issue) => issue.record_id === tamperResult.record?.id
    )
    expect(tamperedIssue).toBeDefined()
    expect(tamperedIssue?.status).toBe("FLAGGED")
    expect(tamperedIssue?.hash_valid).toBe(false)
    expect(tamperedIssue?.error).toContain("Content hash mismatch")
  })

  it("resets demo data cleanly back to verified state", () => {
    demoStore.tamperRecord("GR-000001", "A+")
    expect(demoStore.verifyLedger().status).toBe("FLAGGED")

    demoStore.resetDemoData()
    const report = demoStore.verifyLedger()
    expect(report.status).toBe("VERIFIED")
    expect(report.total).toBe(8)
    expect(report.invalid).toBe(0)
  })
})
