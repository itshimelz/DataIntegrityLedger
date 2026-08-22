"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import type {
  AuditEvent,
  Course,
  GradeRecord,
  LedgerVerificationReport,
  Student,
  VerificationResult,
} from "@/lib/types"

export interface EnrichedGradeRecord extends GradeRecord {
  student?: Student
  course?: Course
  faculty?: {
    id: string
    name: string
    email: string
    public_key: string
  }
  verification?: VerificationResult
}

export interface TamperSimulationState {
  recordId: string
  studentName: string
  courseCode: string
  previousGrade: string
  tamperedGrade: string
  tamperedAt: string
}

interface LedgerContextType {
  records: EnrichedGradeRecord[]
  students: Student[]
  courses: Course[]
  faculty: Array<{
    id: string
    name: string
    email: string
    public_key: string
  }>
  auditEvents: AuditEvent[]
  verificationReport: LedgerVerificationReport | null
  loading: boolean
  isVerifying: boolean
  tamperSimulation: TamperSimulationState | null
  selectedRecordForCrypto: EnrichedGradeRecord | null
  isAddModalOpen: boolean
  isTamperModalOpen: boolean
  activeSignerId: string
  setActiveSignerId: (id: string) => void
  setSelectedRecordForCrypto: (record: EnrichedGradeRecord | null) => void
  setIsAddModalOpen: (open: boolean) => void
  setIsTamperModalOpen: (open: boolean) => void
  refreshData: () => Promise<void>
  runVerification: () => Promise<LedgerVerificationReport | null>
  addGradeRecord: (params: {
    student_id: string
    course_id: string
    grade: string
    faculty_id: string
  }) => Promise<{ success: boolean; record?: GradeRecord; error?: string }>
  simulateTamper: (
    target: string,
    newGrade: string
  ) => Promise<{ success: boolean; error?: string }>
  resetDemoData: () => Promise<void>
}

const LedgerContext = createContext<LedgerContextType | null>(null)

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<EnrichedGradeRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [faculty, setFaculty] = useState<
    Array<{ id: string; name: string; email: string; public_key: string }>
  >([])
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [verificationReport, setVerificationReport] =
    useState<LedgerVerificationReport | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [tamperSimulation, setTamperSimulation] =
    useState<TamperSimulationState | null>(null)
  const [selectedRecordForCrypto, setSelectedRecordForCrypto] =
    useState<EnrichedGradeRecord | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
  const [isTamperModalOpen, setIsTamperModalOpen] = useState<boolean>(false)
  const [activeSignerId, setActiveSignerId] = useState<string>("fac-mamun-001")

  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/grades")
      const data = await res.json()
      if (data.success) {
        // Also fetch verification report silently to keep status sync
        const verifyRes = await fetch("/api/verification")
        const verifyData = await verifyRes.json()
        const report: LedgerVerificationReport | null = verifyData.success
          ? verifyData.report
          : null

        setVerificationReport(report)

        const issueMap = new Map<string, VerificationResult>()
        if (report?.issues) {
          for (const issue of report.issues) {
            issueMap.set(issue.record_id, issue)
          }
        }

        const hydrated: EnrichedGradeRecord[] = data.records.map(
          (rec: EnrichedGradeRecord) => ({
            ...rec,
            verification: issueMap.get(rec.id) || {
              record_id: rec.id,
              block_index: rec.block_index,
              hash_valid: true,
              chain_valid: true,
              signature_valid: true,
              status: "VERIFIED",
            },
          })
        )

        setRecords(hydrated)
        setStudents(data.students || [])
        setCourses(data.courses || [])
        setFaculty(data.faculty || [])
        setAuditEvents(data.auditEvents || [])
      }
    } catch (err) {
      console.error("Failed to fetch ledger data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const runVerification = useCallback(async () => {
    setIsVerifying(true)
    try {
      // Add slight natural delay for realistic visual scan
      await new Promise((r) => setTimeout(r, 450))
      const res = await fetch("/api/verification", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setVerificationReport(data.report)

        const issueMap = new Map<string, VerificationResult>()
        for (const issue of data.report.issues) {
          issueMap.set(issue.record_id, issue)
        }

        setRecords((prev) =>
          prev.map((rec) => ({
            ...rec,
            verification: issueMap.get(rec.id) || {
              record_id: rec.id,
              block_index: rec.block_index,
              hash_valid: true,
              chain_valid: true,
              signature_valid: true,
              status: "VERIFIED",
            },
          }))
        )
        return data.report
      }
      return null
    } catch (err) {
      console.error("Verification failed:", err)
      return null
    } finally {
      setIsVerifying(false)
    }
  }, [])

  const addGradeRecord = useCallback(
    async (params: {
      student_id: string
      course_id: string
      grade: string
      faculty_id: string
    }) => {
      try {
        const res = await fetch("/api/grades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        })
        const data = await res.json()
        if (data.success) {
          await refreshData()
          return { success: true, record: data.record }
        }
        return { success: false, error: data.error || "Failed to add grade" }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Network error",
        }
      }
    },
    [refreshData]
  )

  const simulateTamper = useCallback(
    async (target: string, newGrade: string) => {
      try {
        const res = await fetch("/api/demo/tamper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target, newGrade }),
        })
        const data = await res.json()
        if (data.success) {
          const rec: GradeRecord = data.record
          const student = students.find((s) => s.id === rec.student_id)
          const course = courses.find((c) => c.id === rec.course_id)

          setTamperSimulation({
            recordId: rec.id,
            studentName: student?.name || rec.student_id,
            courseCode: course?.course_code || rec.course_id,
            previousGrade: data.previousGrade || "Unknown",
            tamperedGrade: newGrade,
            tamperedAt: new Date().toLocaleTimeString(),
          })

          await refreshData()
          return { success: true }
        }
        return { success: false, error: data.error || "Tampering failed" }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Network error",
        }
      }
    },
    [students, courses, refreshData]
  )

  const resetDemoData = useCallback(async () => {
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setTamperSimulation(null)
        await refreshData()
      }
    } catch (err) {
      console.error("Failed to reset demo data:", err)
    }
  }, [refreshData])

  return (
    <LedgerContext.Provider
      value={{
        records,
        students,
        courses,
        faculty,
        auditEvents,
        verificationReport,
        loading,
        isVerifying,
        tamperSimulation,
        selectedRecordForCrypto,
        isAddModalOpen,
        isTamperModalOpen,
        activeSignerId,
        setActiveSignerId,
        setSelectedRecordForCrypto,
        setIsAddModalOpen,
        setIsTamperModalOpen,
        refreshData,
        runVerification,
        addGradeRecord,
        simulateTamper,
        resetDemoData,
      }}
    >
      {children}
    </LedgerContext.Provider>
  )
}

export function useLedger() {
  const context = useContext(LedgerContext)
  if (!context) {
    throw new Error("useLedger must be used within a LedgerProvider")
  }
  return context
}
