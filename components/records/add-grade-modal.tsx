"use client"

import React, { useState } from "react"
import {
  PlusCircle,
  Key,
  ShieldCheck,
  WarningCircle,
  GraduationCap,
  BookOpen,
} from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { toast } from "sonner"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"]

export function AddGradeModal() {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    students,
    courses,
    faculty,
    records,
    addGradeRecord,
    activeSignerId,
  } = useLedger()

  const [studentId, setStudentId] = useState<string>("")
  const [courseId, setCourseId] = useState<string>("")
  const [grade, setGrade] = useState<string>("A")
  const [facultyId, setFacultyId] = useState<string>(activeSignerId)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Initialize defaults when opening
  React.useEffect(() => {
    if (isAddModalOpen) {
      if (students.length > 0 && !studentId) setStudentId(students[0].id)
      if (courses.length > 0 && !courseId) setCourseId(courses[0].id)
      if (faculty.length > 0 && !facultyId) setFacultyId(faculty[0].id)
      setErrorMessage(null)
    }
  }, [
    isAddModalOpen,
    students,
    courses,
    faculty,
    studentId,
    courseId,
    facultyId,
  ])

  const nextBlockIndex =
    records.length > 0 ? records[records.length - 1].block_index + 1 : 1
  const lastHash =
    records.length > 0
      ? records[records.length - 1].record_hash
      : "0000000000000000000000000000000000000000000000000000000000000000"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!studentId || !courseId || !grade || !facultyId) {
      setErrorMessage("Please complete all required fields.")
      return
    }

    setIsSubmitting(true)
    const res = await addGradeRecord({
      student_id: studentId,
      course_id: courseId,
      grade,
      faculty_id: facultyId,
    })

    setIsSubmitting(false)

    if (res.success && res.record) {
      const selectedStudent = students.find((s) => s.id === studentId)
      const selectedCourse = courses.find((c) => c.id === courseId)
      
      toast.success(
        `Block #${res.record.block_index} signed and appended to ledger`,
        {
          description: `${selectedStudent?.name || studentId} awarded grade ${grade} for ${selectedCourse?.course_code || courseId}.`,
        }
      )
      setIsAddModalOpen(false)
    } else {
      setErrorMessage(res.error || "Failed to create signed grade record")
      toast.error("Failed to append grade block", {
        description: res.error || "Please check inputs and try again.",
      })
    }
  }

  return (
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col overflow-y-auto rounded-none border border-border bg-card p-6 sm:max-w-xl md:max-w-2xl">
        <DialogHeader className="border-b border-border/60 pr-10 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
              <PlusCircle className="size-5" weight="bold" />
            </div>
            <div>
              <DialogTitle className="font-heading text-sm font-semibold tracking-wider text-foreground uppercase">
                Issue Signed Grade Record
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Creates a new tamper-evident ledger block with SHA-256 hash
                chaining and faculty RSA-2048 signature.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-1">
          {errorMessage && (
            <div className="border border-l-2 border-destructive/40 border-l-destructive bg-destructive/10 p-3 text-xs leading-relaxed text-destructive">
              <div className="flex items-center gap-2 font-mono">
                <WarningCircle className="size-4 shrink-0" weight="fill" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Student Selector */}
          <div>
            <label className="mb-1.5 flex h-5 items-center gap-1.5 font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              <GraduationCap className="size-3.5 text-primary" weight="bold" />
              Student
            </label>
            <Select
              value={studentId}
              onValueChange={(val) => {
                if (typeof val === "string") setStudentId(val)
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-none border border-border bg-card px-3 font-sans text-xs text-foreground">
                <SelectValue placeholder="Select Student">
                  {(() => {
                    const s = students.find((item) => item.id === studentId)
                    return s
                      ? `${s.name} (${s.student_id}) — ${s.department}`
                      : "Select Student"
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex flex-col py-0.5 text-left">
                      <span className="font-medium text-foreground">
                        {s.name} ({s.student_id})
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {s.department}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Course Selector */}
          <div>
            <label className="mb-1.5 flex h-5 items-center gap-1.5 font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              <BookOpen className="size-3.5 text-primary" weight="bold" />
              Course
            </label>
            <Select
              value={courseId}
              onValueChange={(val) => {
                if (typeof val === "string") setCourseId(val)
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-none border border-border bg-card px-3 font-sans text-xs text-foreground">
                <SelectValue placeholder="Select Course">
                  {(() => {
                    const c = courses.find((item) => item.id === courseId)
                    return c
                      ? `${c.course_code}: ${c.course_name}`
                      : "Select Course"
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex flex-col py-0.5 text-left">
                      <span className="font-medium text-foreground">
                        {c.course_code}: {c.course_name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade Selector & Faculty Signer */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-1.5 flex h-5 items-center gap-1.5 font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                <PlusCircle className="size-3.5 text-primary" weight="bold" />
                Final Grade Awarded
              </label>
              <Select
                value={grade}
                onValueChange={(val) => {
                  if (typeof val === "string") setGrade(val)
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-none border border-border bg-card px-3 font-sans text-xs font-semibold text-primary">
                  <SelectValue placeholder="Select Grade">
                    {grade ? `Grade ${grade}` : "Select Grade"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      <span className="font-mono font-bold text-foreground">
                        Grade {g}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <label className="mb-1.5 flex h-5 items-center gap-1.5 font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                <Key className="size-3.5 text-primary" weight="bold" />
                Authorized Faculty Signer
              </label>
              <Select
                value={facultyId}
                onValueChange={(val) => {
                  if (typeof val === "string") setFacultyId(val)
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-none border border-border bg-card px-3 font-sans text-xs text-foreground">
                  <SelectValue placeholder="Select Signer">
                    {(() => {
                      const f = faculty.find((item) => item.id === facultyId)
                      return f ? `${f.name} (${f.email})` : "Select Signer"
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {faculty.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      <div className="flex flex-col py-0.5 text-left">
                        <span className="font-medium text-foreground">
                          {f.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {f.email} • Faculty of CSE
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cryptographic Linkage Preview - Stylized Left Border Callout */}
          <div className="border border-l-2 border-border/40 border-l-primary bg-muted/20 p-3.5">
            <div className="flex items-center justify-between pb-2 font-heading text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <span className="flex items-center gap-1.5 text-primary">
                <ShieldCheck className="size-3.5" weight="bold" />
                Cryptographic Chaining Preview
              </span>
              <span className="font-mono text-xs tracking-wide text-muted-foreground italic">
                Next Block #{nextBlockIndex}
              </span>
            </div>
            <div className="mt-2 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">
                  Previous Block Hash:
                </span>
                <span className="max-w-[220px] truncate text-foreground">
                  {lastHash.substring(0, 16)}...{lastHash.substring(48)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">
                  Signing Algorithm:
                </span>
                <span className="font-semibold text-primary">
                  RSA-2048 / SHA-256
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-none border border-border bg-card font-heading text-xs font-semibold tracking-widest text-foreground uppercase hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="rounded-none bg-primary font-heading text-xs font-semibold tracking-widest text-primary-foreground uppercase hover:bg-primary/90"
            >
              {isSubmitting
                ? "Signing & Appending..."
                : "Sign & Append Block"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
