"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  MagnifyingGlass,
  Eye,
  Key,
  Bug,
  Plus,
  Copy,
  Check,
  PencilSimpleLine,
} from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"
import { StatusBadge } from "@/components/common/status-badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function GradeTable() {
  const {
    records,
    courses,
    setSelectedRecordForCrypto,
    setIsAddModalOpen,
    setIsTamperModalOpen,
    setRecordToEdit,
  } = useLedger()

  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<string>("ALL")
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null)

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.student?.student_id
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        rec.course?.course_code
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        rec.record_hash.toLowerCase().includes(searchQuery.toLowerCase())

      // Course filter
      const matchesCourse =
        selectedCourse === "ALL" || rec.course_id === selectedCourse

      // Status filter
      const status = rec.verification?.status || "VERIFIED"
      const matchesStatus =
        selectedStatus === "ALL" || status === selectedStatus

      return matchesSearch && matchesCourse && matchesStatus
    })
  }, [records, searchQuery, selectedCourse, selectedStatus])

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash)
    setCopiedHashId(id)
    toast.success("SHA-256 Digest Copied", {
      description: `${hash.substring(0, 16)}... copied to clipboard.`,
    })
    setTimeout(() => setCopiedHashId(null), 2000)
  }

  return (
    <Card className="rounded-md border border-border bg-card">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Grade Ledger Records Browser
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Explore all authenticated blocks in the append-only cryptographic
              ledger chain.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTamperModalOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20 active:translate-y-px"
            >
              <Bug className="size-3.5" weight="bold" />
              <span>Simulate Tamper</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-transparent bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px"
            >
              <Plus className="size-3.5" weight="bold" />
              <span>Add Record</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
          {/* Search Input */}
          <div className="relative flex items-center">
            <MagnifyingGlass className="absolute left-3 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search student, ID, course code, or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-md border-border bg-transparent pl-9 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary"
            />
          </div>

          {/* Course Dropdown via shadcn Select */}
          <div>
            <Select
              value={selectedCourse}
              onValueChange={(val) => {
                if (typeof val === "string") setSelectedCourse(val)
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-md border border-border bg-card px-3 font-sans text-xs text-foreground">
                <SelectValue placeholder="All Courses">
                  {(() => {
                    if (selectedCourse === "ALL")
                      return `All Courses (${courses.length})`
                    const c = courses.find((item) => item.id === selectedCourse)
                    return c
                      ? `${c.course_code}: ${c.course_name}`
                      : "All Courses"
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  All Courses ({courses.length})
                </SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.course_code}: {c.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Dropdown via shadcn Select */}
          <div>
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                if (typeof val === "string") setSelectedStatus(val)
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-md border border-border bg-card px-3 font-sans text-xs text-foreground">
                <SelectValue placeholder="All Statuses">
                  {selectedStatus === "ALL"
                    ? "All Verification Statuses"
                    : selectedStatus === "VERIFIED"
                      ? "Verified Blocks Only"
                      : "Flagged / Tampered Only"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Verification Statuses</SelectItem>
                <SelectItem value="VERIFIED">Verified Blocks Only</SelectItem>
                <SelectItem value="FLAGGED">Flagged / Tampered Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <TableHead className="px-3 py-3">Block</TableHead>
              <TableHead className="px-3 py-3">Student</TableHead>
              <TableHead className="px-3 py-3">Course</TableHead>
              <TableHead className="px-3 py-3 text-center">Grade</TableHead>
              <TableHead className="px-3 py-3">Faculty Signer</TableHead>
              <TableHead className="px-3 py-3">SHA-256 Digest</TableHead>
              <TableHead className="px-3 py-3">Status</TableHead>
              <TableHead className="px-3 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center font-mono text-xs text-muted-foreground uppercase"
                >
                  No matching grade records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((rec) => {
                const status = rec.verification?.status || "VERIFIED"
                const isTampered = status === "FLAGGED"

                return (
                  <TableRow
                    key={rec.id}
                    className={`transition-colors hover:bg-muted/30 ${
                      isTampered ? "bg-destructive/10" : ""
                    }`}
                  >
                    <TableCell className="px-3 py-3 font-mono font-semibold text-foreground">
                      #{rec.block_index}
                      <span className="block font-mono text-[11px] font-normal text-muted-foreground">
                        {rec.id}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="font-medium text-foreground">
                        {rec.student?.name || rec.student_id}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        ID: {rec.student?.student_id || rec.student_id}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {rec.course?.course_code}
                      </div>
                      <div className="max-w-[140px] truncate text-[11px] text-muted-foreground">
                        {rec.course?.course_name}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3 text-center">
                      {/* ponytail: grade stays neutral; the StatusBadge is the single status signal */}
                      <span className="font-mono text-sm font-bold text-foreground">
                        {rec.grade}
                      </span>
                      {rec.corrects_record_id && (
                        <span className="block font-mono text-[10px] font-normal text-primary">
                          ↺ corrects {rec.corrects_record_id}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Key className="size-3 shrink-0 text-primary" />
                        <span className="max-w-[110px] truncate">
                          {rec.faculty?.name || rec.signed_by}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                        <span className="max-w-[110px] truncate">
                          {rec.record_hash.substring(0, 6)}...
                          {rec.record_hash.substring(58)}
                        </span>
                        <motion.button
                          type="button"
                          onClick={() => copyHash(rec.record_hash, rec.id)}
                          whileHover={{ y: -1 }}
                          whileTap={{ y: 0 }}
                          transition={{ duration: 0.12 }}
                          className="cursor-pointer text-muted-foreground hover:text-foreground"
                          aria-label="Copy full SHA-256 hash"
                          title="Copy full hash"
                        >
                          {copiedHashId === rec.id ? (
                            <Check className="size-3 text-primary" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </motion.button>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <StatusBadge status={status} size="sm" />
                    </TableCell>
                    <TableCell className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* FR-07: corrections append a new signed block */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRecordToEdit(rec)}
                          disabled={isTampered}
                          title={
                            isTampered
                              ? "Flagged records cannot be corrected — investigate the integrity failure first"
                              : `Issue a signed correction for ${rec.id}`
                          }
                          aria-label="Correct grade"
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-border bg-card p-0 text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <PencilSimpleLine className="size-4 text-primary" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecordForCrypto(rec)}
                          aria-label="Inspect cryptographic details"
                          title="Inspect cryptographic details"
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-border bg-card p-0 text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                        >
                          <Eye className="size-4 text-primary" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
