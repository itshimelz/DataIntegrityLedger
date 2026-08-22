// ponytail: standard node:crypto createSign / createVerify for RSA-2048 SHA-256 signatures

import { createSign, createVerify } from "node:crypto"

/**
 * Signs a hash or string using an RSA-2048 private key (PEM format).
 * Returns base64 encoded signature.
 */
export function signHash(hashOrData: string, privateKeyPem: string): string {
  const signer = createSign("SHA256")
  signer.update(hashOrData)
  signer.end()
  return signer.sign(privateKeyPem, "base64")
}

/**
 * Verifies an RSA-2048 base64 signature against a hash/string and public key (PEM format).
 * Returns true if valid, false otherwise (safely handles malformed keys/signatures).
 */
export function verifySignature(
  hashOrData: string,
  signatureBase64: string,
  publicKeyPem: string
): boolean {
  try {
    const verifier = createVerify("SHA256")
    verifier.update(hashOrData)
    verifier.end()
    return verifier.verify(publicKeyPem, signatureBase64, "base64")
  } catch {
    // ponytail: fail gracefully on malformed signatures or keys without crashing
    return false
  }
}
