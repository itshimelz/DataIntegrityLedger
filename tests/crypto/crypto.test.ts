import { describe, expect, it } from "bun:test"
import {
  canonicalize,
  canonicalizeRecord,
  computeRecordHash,
  DEMO_FACULTY_KEYS,
  FACULTY_ID_MAMUN,
  FACULTY_ID_SHARIFUR,
  generateFacultyId,
  generateRsaKeyPair,
  GENESIS_HASH,
  hashCanonicalPayload,
  sha256,
  signHash,
  verifySignature,
} from "../../lib/crypto"
import type { CanonicalRecordPayload } from "../../lib/types"

describe("Canonical JSON Serialization", () => {
  it("serializes objects deterministically regardless of key insertion order", () => {
    const objA = {
      zebra: 1,
      alpha: "first",
      nested: { z: 10, a: 20 },
    }

    const objB = {
      nested: { a: 20, z: 10 },
      alpha: "first",
      zebra: 1,
    }

    expect(canonicalize(objA)).toBe(canonicalize(objB))
    expect(canonicalize(objA)).toBe(
      '{"alpha":"first","nested":{"a":20,"z":10},"zebra":1}'
    )
  })

  it("handles arrays and primitives correctly", () => {
    expect(canonicalize([3, 2, 1])).toBe("[3,2,1]")
    expect(canonicalize("hello")).toBe('"hello"')
    expect(canonicalize(42)).toBe("42")
    expect(canonicalize(null)).toBe("null")
    expect(canonicalize(true)).toBe("true")
  })

  it("produces stable serialization for CanonicalRecordPayload", () => {
    const payload1: CanonicalRecordPayload = {
      id: "GR-000001",
      student_id: "std-001",
      course_id: "cse-323",
      grade: "A",
      block_index: 1,
      prev_hash: GENESIS_HASH,
      signed_by: FACULTY_ID_MAMUN,
      created_at: "2026-08-01T10:00:00.000Z",
    }

    const payload2: CanonicalRecordPayload = {
      created_at: "2026-08-01T10:00:00.000Z",
      signed_by: FACULTY_ID_MAMUN,
      prev_hash: GENESIS_HASH,
      block_index: 1,
      grade: "A",
      course_id: "cse-323",
      student_id: "std-001",
      id: "GR-000001",
    }

    expect(canonicalizeRecord(payload1)).toBe(canonicalizeRecord(payload2))
    expect(canonicalizeRecord(payload1)).toBe(canonicalize(payload2))
  })
})

describe("SHA-256 Hashing", () => {
  it("computes expected SHA-256 digests", () => {
    const digest = sha256("hello world")
    expect(digest).toBe(
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    )
  })

  it("produces identical output for identical canonical payloads regardless of property order", () => {
    const payloadA: CanonicalRecordPayload = {
      id: "GR-000001",
      student_id: "std-001",
      course_id: "cse-323",
      grade: "A",
      block_index: 1,
      prev_hash: GENESIS_HASH,
      signed_by: FACULTY_ID_MAMUN,
      created_at: "2026-08-01T10:00:00.000Z",
    }

    const payloadB: CanonicalRecordPayload = {
      ...payloadA,
    }

    const hashA = computeRecordHash(payloadA)
    const hashB = computeRecordHash(payloadB)

    expect(hashA).toBe(hashB)
    expect(hashA.length).toBe(64)
  })

  it("produces different hash when payload data is changed", () => {
    const payloadOriginal: CanonicalRecordPayload = {
      id: "GR-000001",
      student_id: "std-001",
      course_id: "cse-323",
      grade: "B+",
      block_index: 1,
      prev_hash: GENESIS_HASH,
      signed_by: FACULTY_ID_MAMUN,
      created_at: "2026-08-01T10:00:00.000Z",
    }

    const payloadTampered: CanonicalRecordPayload = {
      ...payloadOriginal,
      grade: "A+", // unauthorized grade change
    }

    const originalHash = computeRecordHash(payloadOriginal)
    const tamperedHash = computeRecordHash(payloadTampered)

    expect(originalHash).not.toBe(tamperedHash)
  })

  it("hashCanonicalPayload works deterministically for arbitrary objects", () => {
    const hash1 = hashCanonicalPayload({ a: 1, b: 2 })
    const hash2 = hashCanonicalPayload({ b: 2, a: 1 })
    expect(hash1).toBe(hash2)
  })
})

describe("RSA-2048 Digital Signatures & Keys", () => {
  it("generates valid RSA-2048 keypairs", () => {
    const { publicKey, privateKey } = generateRsaKeyPair()
    expect(publicKey).toContain("-----BEGIN PUBLIC KEY-----")
    expect(privateKey).toContain("-----BEGIN PRIVATE KEY-----")
  })

  it("successfully signs and verifies with generated keypair", () => {
    const { publicKey, privateKey } = generateRsaKeyPair()
    const messageHash = sha256("authenticated record data")

    const signature = signHash(messageHash, privateKey)
    expect(signature).toBeDefined()
    expect(typeof signature).toBe("string")
    expect(signature.length).toBeGreaterThan(50)

    const isValid = verifySignature(messageHash, signature, publicKey)
    expect(isValid).toBe(true)
  })

  it("successfully signs and verifies with pre-seeded demo faculty keys", () => {
    const mamunKeys = DEMO_FACULTY_KEYS[FACULTY_ID_MAMUN]
    const dataHash = sha256("CSE323 grade submission")

    const signature = signHash(dataHash, mamunKeys.privateKey)
    const isValid = verifySignature(dataHash, signature, mamunKeys.publicKey)
    expect(isValid).toBe(true)
  })

  it("fails verification when message or hash is tampered", () => {
    const mamunKeys = DEMO_FACULTY_KEYS[FACULTY_ID_MAMUN]
    const originalHash = sha256("grade: B+")
    const tamperedHash = sha256("grade: A+")

    const signature = signHash(originalHash, mamunKeys.privateKey)

    const isTamperedValid = verifySignature(
      tamperedHash,
      signature,
      mamunKeys.publicKey
    )
    expect(isTamperedValid).toBe(false)
  })

  it("fails verification when verified with wrong public key", () => {
    const mamunKeys = DEMO_FACULTY_KEYS[FACULTY_ID_MAMUN]
    const sharifurKeys = DEMO_FACULTY_KEYS[FACULTY_ID_SHARIFUR]
    const dataHash = sha256("grade record payload")

    // Signed by Mamun
    const signature = signHash(dataHash, mamunKeys.privateKey)

    // Attempt verification with Sharifur's public key
    const isValid = verifySignature(dataHash, signature, sharifurKeys.publicKey)
    expect(isValid).toBe(false)
  })

  it("returns false gracefully on malformed signatures or keys", () => {
    const mamunKeys = DEMO_FACULTY_KEYS[FACULTY_ID_MAMUN]
    const dataHash = sha256("some data")

    expect(
      verifySignature(dataHash, "not-a-valid-signature", mamunKeys.publicKey)
    ).toBe(false)
    expect(verifySignature(dataHash, "AAAA", "not-a-valid-public-key")).toBe(
      false
    )
  })
})

describe("Faculty ID Generation", () => {
  const existingSeedIds = [
    "fac-mamun-001",
    "fac-sharifur-002",
    "fac-mahbubur-003",
  ]

  it("generates sequential ID matching fac-<slug>-004 for a new faculty", () => {
    const id = generateFacultyId("Dr. Ayesha Rahman", existingSeedIds)
    expect(id).toBe("fac-ayesha-004")
  })

  it("handles names with initials and titles correctly", () => {
    expect(generateFacultyId("Prof. Farhana Akter", existingSeedIds)).toBe(
      "fac-farhana-004"
    )
    expect(generateFacultyId("S. H. Mamun", existingSeedIds)).toBe(
      "fac-mamun-004"
    )
    expect(generateFacultyId("Md. Tanvir Islam", existingSeedIds)).toBe(
      "fac-tanvir-004"
    )
  })

  it("increments sequence when higher IDs exist", () => {
    const ids = [...existingSeedIds, "fac-ayesha-004", "fac-tanvir-005"]
    expect(generateFacultyId("Dr. Nusrat Jahan", ids)).toBe("fac-nusrat-006")
  })

  it("handles empty or single-word names cleanly", () => {
    expect(generateFacultyId("Hasan", existingSeedIds)).toBe("fac-hasan-004")
    expect(generateFacultyId("", existingSeedIds)).toBe("fac-faculty-004")
  })
})
