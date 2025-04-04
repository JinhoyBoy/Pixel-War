//
// Session Management mit JWT -> wird von der actions.js importiert
//

"use server"

import { SignJWT, jwtVerify } from "jose"

// Secret Key für die JWT-Token
const secretKey = process.env.SESSION_SECRET
if (!secretKey) {
  throw new Error("SESSION_SECRET is not set")
}
const encodedKey = new TextEncoder().encode(secretKey)

// Encrypt session data
export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token läuft nach 7 Tagen ab
    .sign(encodedKey)
}

// Decrypt session data
export async function decrypt(session) {
  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    console.error("Failed to verify session:", error)
    return null
  }
}

