// ponytail: AES-256-GCM envelope for faculty private keys at rest (FR-03: never plaintext in DB).
// Key derived via SHA-256 from the LEDGER_SIGNING_KEY env secret; upgrade to KMS envelope encryption if key rotation ever matters.
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto"

function aesKey(): Buffer {
  const secret = process.env.LEDGER_SIGNING_KEY
  if (!secret) {
    throw new Error(
      "LEDGER_SIGNING_KEY is required to encrypt faculty signing keys"
    )
  }
  return createHash("sha256").update(secret).digest()
}

export function encryptPrivateKey(plaintextPem: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", aesKey(), iv)
  const ciphertext = Buffer.concat([
    cipher.update(plaintextPem, "utf8"),
    cipher.final(),
  ])
  return [
    "v1",
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    ciphertext.toString("base64"),
  ].join(":")
}

export function decryptPrivateKey(blob: string): string {
  const [version, iv, authTag, ciphertext] = blob.split(":")
  if (version !== "v1") {
    throw new Error(`Unsupported private key blob version: ${version}`)
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    aesKey(),
    Buffer.from(iv, "base64")
  )
  decipher.setAuthTag(Buffer.from(authTag, "base64"))
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8")
}
