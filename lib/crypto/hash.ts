// ponytail: clean SHA-256 hashing using standard node:crypto createHash

import { createHash } from "node:crypto"
import type { CanonicalRecordPayload } from "../types"
import { canonicalize, canonicalizeRecord } from "./canonical"

export const GENESIS_HASH = "0".repeat(64)

/**
 * Computes SHA-256 digest hex string from string or Buffer input.
 */
export function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex")
}

/**
 * Serializes a canonical grade record payload and computes its SHA-256 digest.
 */
export function computeRecordHash(payload: CanonicalRecordPayload): string {
  const canonicalJson = canonicalizeRecord(payload)
  return sha256(canonicalJson)
}

/**
 * Convenience helper to hash any object deterministically.
 */
export function hashCanonicalPayload(obj: unknown): string {
  return sha256(canonicalize(obj))
}
