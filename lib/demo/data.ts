// ponytail: deterministic demo seed dataset matching SRS §17

import {
  computeRecordHash,
  DEMO_FACULTY_KEYS,
  FACULTY_ID_MAHBUBUR,
  FACULTY_ID_MAMUN,
  FACULTY_ID_SHARIFUR,
  GENESIS_HASH,
  signHash,
} from "../crypto"
import type {
  CanonicalRecordPayload,
  Course,
  FacultyUser,
  GradeRecord,
  Student,
} from "../types"

export const INITIAL_FACULTY: FacultyUser[] = [
  {
    id: FACULTY_ID_MAMUN,
    name: "S. H. Mamun",
    email: "mamun@university.edu",
    role: "FACULTY",
    public_key: DEMO_FACULTY_KEYS[FACULTY_ID_MAMUN].publicKey,
    private_key: DEMO_FACULTY_KEYS[FACULTY_ID_MAMUN].privateKey,
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: FACULTY_ID_SHARIFUR,
    name: "Sharifur Rahman",
    email: "sharifur@university.edu",
    role: "FACULTY",
    public_key: DEMO_FACULTY_KEYS[FACULTY_ID_SHARIFUR].publicKey,
    private_key: DEMO_FACULTY_KEYS[FACULTY_ID_SHARIFUR].privateKey,
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: FACULTY_ID_MAHBUBUR,
    name: "Mahbubur Rahman",
    email: "mahbubur@university.edu",
    role: "FACULTY",
    public_key: DEMO_FACULTY_KEYS[FACULTY_ID_MAHBUBUR].publicKey,
    private_key: DEMO_FACULTY_KEYS[FACULTY_ID_MAHBUBUR].privateKey,
    created_at: "2026-08-01T08:00:00.000Z",
  },
]

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-cse323",
    course_code: "CSE 323",
    course_name: "Operating Systems",
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "course-cse315",
    course_code: "CSE 315",
    course_name: "Database Systems",
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "course-cse208",
    course_code: "CSE 208",
    course_name: "Data Structures & Algorithms",
    created_at: "2026-08-01T08:00:00.000Z",
  },
]

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "std-001",
    student_id: "20261234",
    name: "Rafiq Ahmed",
    department: "Computer Science & Engineering",
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "std-002",
    student_id: "20261235",
    name: "Nusrat Jahan",
    department: "Computer Science & Engineering",
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "std-003",
    student_id: "20261236",
    name: "Tanvir Islam",
    department: "Computer Science & Engineering",
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "std-004",
    student_id: "20261237",
    name: "Farhana Akter",
    department: "Computer Science & Engineering",
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "std-005",
    student_id: "20261238",
    name: "Imran Kabir",
    department: "Computer Science & Engineering",
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "std-006",
    student_id: "20261239",
    name: "Sadia Rahman",
    department: "Computer Science & Engineering",
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "std-007",
    student_id: "20261240",
    name: "Mahin Hasan",
    department: "Computer Science & Engineering",
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "std-008",
    student_id: "20261241",
    name: "Proma Chowdhury",
    department: "Computer Science & Engineering",
    created_at: "2026-08-01T08:00:00.000Z",
  },
]

interface RawSeedEntry {
  id: string
  student_id: string
  course_id: string
  grade: string
  signed_by: string
  created_at: string
}

const RAW_INITIAL_RECORDS: RawSeedEntry[] = [
  {
    id: "GR-000001",
    student_id: "std-001",
    course_id: "course-cse323",
    grade: "B+",
    signed_by: FACULTY_ID_MAMUN,
    created_at: "2026-08-10T09:00:00.000Z",
  },
  {
    id: "GR-000002",
    student_id: "std-002",
    course_id: "course-cse323",
    grade: "A",
    signed_by: FACULTY_ID_MAMUN,
    created_at: "2026-08-10T09:15:00.000Z",
  },
  {
    id: "GR-000003",
    student_id: "std-003",
    course_id: "course-cse315",
    grade: "A-",
    signed_by: FACULTY_ID_SHARIFUR,
    created_at: "2026-08-11T10:00:00.000Z",
  },
  {
    id: "GR-000004",
    student_id: "std-004",
    course_id: "course-cse315",
    grade: "B",
    signed_by: FACULTY_ID_SHARIFUR,
    created_at: "2026-08-11T10:30:00.000Z",
  },
  {
    id: "GR-000005",
    student_id: "std-005",
    course_id: "course-cse208",
    grade: "A+",
    signed_by: FACULTY_ID_MAHBUBUR,
    created_at: "2026-08-12T14:00:00.000Z",
  },
  {
    id: "GR-000006",
    student_id: "std-006",
    course_id: "course-cse208",
    grade: "A",
    signed_by: FACULTY_ID_MAHBUBUR,
    created_at: "2026-08-12T14:30:00.000Z",
  },
  {
    id: "GR-000007",
    student_id: "std-007",
    course_id: "course-cse323",
    grade: "B-",
    signed_by: FACULTY_ID_MAMUN,
    created_at: "2026-08-13T11:00:00.000Z",
  },
  {
    id: "GR-000008",
    student_id: "std-008",
    course_id: "course-cse315",
    grade: "A",
    signed_by: FACULTY_ID_SHARIFUR,
    created_at: "2026-08-13T11:45:00.000Z",
  },
]

/**
 * Builds a pristine, sequentially hashed and RSA-signed ledger chain from seed data.
 */
export function buildInitialChain(): GradeRecord[] {
  const records: GradeRecord[] = []
  let prevHash = GENESIS_HASH

  for (let i = 0; i < RAW_INITIAL_RECORDS.length; i++) {
    const raw = RAW_INITIAL_RECORDS[i]
    const blockIndex = i + 1

    const payload: CanonicalRecordPayload = {
      id: raw.id,
      student_id: raw.student_id,
      course_id: raw.course_id,
      grade: raw.grade,
      block_index: blockIndex,
      prev_hash: prevHash,
      signed_by: raw.signed_by,
      created_at: raw.created_at,
    }

    const recordHash = computeRecordHash(payload)
    const privateKey = DEMO_FACULTY_KEYS[raw.signed_by]?.privateKey

    if (!privateKey) {
      throw new Error(`Missing private key for faculty ${raw.signed_by}`)
    }

    const signature = signHash(recordHash, privateKey)

    const record: GradeRecord = {
      id: raw.id,
      student_id: raw.student_id,
      course_id: raw.course_id,
      grade: raw.grade,
      block_index: blockIndex,
      prev_hash: prevHash,
      record_hash: recordHash,
      signature,
      signed_by: raw.signed_by,
      created_at: raw.created_at,
    }

    records.push(record)
    prevHash = recordHash
  }

  return records
}
