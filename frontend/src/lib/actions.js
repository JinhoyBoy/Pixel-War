"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { encrypt, decrypt } from "@/lib/session"

export async function login(username) {
  try {
    // Create a session object with the username and timestamp
    const session = {
      username,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 1 day
    }

    // Encrypt the session
    const encryptedSession = await encrypt(session)

    // Set the encrypted session in a cookie
    const cookieStore = await cookies()
    cookieStore.set("session", encryptedSession, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax",
    })
  } catch (error) {
    console.error("Error creating session:", error)
    throw new Error("Failed to create session")
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/")
}

export async function getUsername() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return null
    }

    // Decrypt the session
    const session = await decrypt(sessionCookie.value)

    // Check if session is expired
    if (!session || session.expiresAt < Date.now()) {
      // Session expired, delete the cookie
      cookieStore.delete("session")
      return null
    }

    return session.username
  } catch (error) {
    console.error("Error getting username:", error)
    return null
  }
}

// Function to get the full session data (for more advanced use cases)
export async function getSession() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return null
    }

    // Decrypt the session
    const session = await decrypt(sessionCookie.value)

    // Check if session is expired
    if (!session || session.expiresAt < Date.now()) {
      // Session expired, delete the cookie
      cookieStore.delete("session")
      return null
    }

    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

