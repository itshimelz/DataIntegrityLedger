// ponytail: minimal deterministic JSON serializer using sorted keys, no external canonicalization dependencies

import type { CanonicalRecordPayload } from "../types"

/**
 * Deterministically serializes any JS object or primitive into a stable JSON string.
 * Recursively sorts all object keys in lexicographical order.
 */
export function canonicalize(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj)
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map((item) => canonicalize(item)).join(",") + "]"
  }

  const record = obj as Record<string, unknown>
  const sortedKeys = Object.keys(record).sort()
  const entries = sortedKeys.map(
    (key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`
  )

  return "{" + entries.join(",") + "}"
}

/**
 * Extracts and canonicalizes the standard CanonicalRecordPayload for a grade record.
 */
export function canonicalizeRecord(payload: CanonicalRecordPayload): string {
  const normalized: CanonicalRecordPayload = {
    id: payload.id,
    student_id: payload.student_id,
    course_id: payload.course_id,
    grade: payload.grade,
    block_index: payload.block_index,
    prev_hash: payload.prev_hash,
    signed_by: payload.signed_by,
    created_at: payload.created_at,
  }

  return canonicalize(normalized)
}
