"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Eye, Key } from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { StatusBadge } from "@/components/common/status-badge"

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export function RecentRecords() {
  const { records, setSelectedRecordForCrypto } = useLedger()

  // Display the 5 most recent records in reverse chronological order
  const recentList = [...records].reverse().slice(0, 5)

  return (
    <Card className="rounded-none border border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/60 pb-4">
        <div>
          <CardTitle className="font-heading text-sm font-semibold tracking-wider text-foreground uppercase">
            Recent Ledger Entries
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Latest authenticated grades committed to the ledger chain.
          </CardDescription>
        </div>
        <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/records"
            className="inline-flex items-center gap-1 font-heading text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:text-primary/80"
          >
            <span>View All ({records.length})</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </motion.div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <TableHead className="px-4 py-3">Block</TableHead>
              <TableHead className="px-4 py-3">Student</TableHead>
              <TableHead className="px-4 py-3">Course</TableHead>
              <TableHead className="px-4 py-3 text-center">Grade</TableHead>
              <TableHead className="px-4 py-3">Authorized Signer</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
              <TableHead className="px-4 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {recentList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center font-mono text-xs text-muted-foreground uppercase"
                >
                  No ledger records found.
                </TableCell>
              </TableRow>
            ) : (
              recentList.map((rec) => {
                const status = rec.verification?.status || "VERIFIED"
                const isTampered = status === "FLAGGED"

                return (
                  <TableRow
                    key={rec.id}
                    className={`transition-colors hover:bg-muted/30 ${
                      isTampered ? "bg-destructive/10" : ""
                    }`}
                  >
                    <TableCell className="px-4 py-3 font-mono font-semibold text-foreground">
                      #{rec.block_index}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {rec.student?.name || rec.student_id}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        ID: {rec.student?.student_id || rec.student_id}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {rec.course?.course_code}
                      </div>
                      <div className="max-w-[160px] truncate text-[11px] text-muted-foreground">
                        {rec.course?.course_name}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {/* ponytail: grade stays neutral; the StatusBadge is the single status signal */}
                      <span className="font-mono text-sm font-bold text-foreground">
                        {rec.grade}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Key className="size-3 text-primary" />
                        <span>{rec.faculty?.name || rec.signed_by}</span>
                      </div>
                      <div className="max-w-[120px] truncate font-mono text-[11px] text-muted-foreground">
                        {rec.signed_by}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge status={status} size="sm" />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <motion.div
                        whileHover={{ y: -1 }}
                        whileTap={{ y: 0 }}
                        transition={{ duration: 0.12 }}
                        className="inline-block"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecordForCrypto(rec)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-border bg-card px-2.5 py-1.5 font-heading text-[11px] font-semibold tracking-widest text-foreground uppercase transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                        >
                          <Eye className="size-3 text-primary" />
                          <span>Inspect</span>
                        </Button>
                      </motion.div>
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
