import { NextResponse } from "next/server"
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server"
import { generateFacultyId, generateRsaKeyPair } from "@/lib/crypto"
import { encryptPrivateKey } from "@/lib/supabase/secretbox"

/**
 * Faculty profile provisioning (FR-03): called once right after sign-up.
 * Generates the teacher's RSA-2048 signing keypair, assigns a human-readable
 * sequential faculty ID (e.g. fac-mamun-001, fac-sharifur-002, fac-mahbubur-003),
 * stores the public key in the users table and the AES-256-GCM encrypted private
 * key in the auth user's metadata (server-only access — never plaintext in the
 * database, never sent to the browser).
 */
// ponytail: in-process per-user lock — parallel double-submits provision once; add a DB advisory lock if this ever runs multi-instance
const provisioning = new Map<string, Promise<NextResponse>>()

export async function POST(req: Request) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (name.length < 2) {
    return NextResponse.json(
      { success: false, error: "Full name is required (min 2 characters)" },
      { status: 400 }
    )
  }

  const existing = provisioning.get(user.id)
  if (existing) return existing

  const task = provisionFaculty(user.id, name, user.email!).finally(() =>
    provisioning.delete(user.id)
  )
  provisioning.set(user.id, task)
  return task
}

async function provisionFaculty(
  userId: string,
  name: string,
  email: string
): Promise<NextResponse> {
  const supabase = await createClient()

  // 1. Idempotent: skip reprovisioning if user already exists by email or id
  const { data: existingByEmail } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (existingByEmail) {
    return NextResponse.json({
      success: true,
      faculty_id: existingByEmail.id,
      already_registered: true,
    })
  }

  const { data: existingById } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  if (existingById) {
    return NextResponse.json({
      success: true,
      faculty_id: existingById.id,
      already_registered: true,
    })
  }

  // 2. Fetch all existing faculty IDs to determine the next sequential ID
  const { data: allUsers } = await supabase.from("users").select("id")
  const existingIds = (allUsers || []).map((u) => u.id)
  const newFacultyId = generateFacultyId(name, existingIds)

  // 3. Generate RSA-2048 signing keypair
  const keyPair = generateRsaKeyPair()
  const private_key_enc = encryptPrivateKey(keyPair.privateKey)

  // 4. Insert into users table with the formatted sequential faculty ID
  const { error: insertError } = await supabase.from("users").insert({
    id: newFacultyId,
    name,
    email,
    role: "FACULTY",
    public_key: keyPair.publicKey,
  })

  if (insertError) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create faculty profile: ${insertError.message}`,
      },
      { status: 500 }
    )
  }

  // 5. Store faculty_id and encrypted private key in auth user metadata
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      full_name: name,
      faculty_id: newFacultyId,
      private_key_enc,
    },
  })

  if (updateError) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to store signing credentials: ${updateError.message}`,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    faculty_id: newFacultyId,
    message: `Faculty signing identity provisioned for ${name} (${newFacultyId})`,
  })
}
