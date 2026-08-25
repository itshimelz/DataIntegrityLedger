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
  let normalizedCreatedAt = payload.created_at
  try {
    const parsed = new Date(payload.created_at)
    if (!isNaN(parsed.getTime())) {
      normalizedCreatedAt = parsed.toISOString()
    }
  } catch {
    // Keep original if not parsable
  }

  const normalized: CanonicalRecordPayload = {
    id: payload.id,
    student_id: payload.student_id,
    course_id: payload.course_id,
    grade: payload.grade,
    block_index: payload.block_index,
    prev_hash: payload.prev_hash,
    signed_by: payload.signed_by,
    created_at: normalizedCreatedAt,
  }

  // Optional field is only present for FR-07 correction blocks; omitted keys
  // keep hashes byte-identical to records created before corrections existed.
  if (payload.corrects_record_id !== undefined) {
    normalized.corrects_record_id = payload.corrects_record_id
  }

  return canonicalize(normalized)
}
