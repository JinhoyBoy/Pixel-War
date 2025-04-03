"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { encrypt, decrypt } from "@/lib/session"

// Funktion für den Login
export async function login(username) {
  try {
    // Neue Session
    const session = {
      username,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 1 day
    }

    // Encrypt die session
    const encryptedSession = await encrypt(session)

    // Setze den Cookie
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

// Funktion für den Logout
// Löscht den Cookie
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/")
}

// Funktion um den Benutzernamen aus dem Cookie zu bekommen
export async function getUsername() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return null
    }

    // Decrypt die session
    const session = await decrypt(sessionCookie.value)

    // Wenn die Session abgelaufen ist, löschen den Cookie
    if (!session || session.expiresAt < Date.now()) {
      cookieStore.delete("session")
      return null
    }

    return session.username
  } catch (error) {
    console.error("Error getting username:", error)
    return null
  }
}

// Funktion um die Session zu bekommen
export async function getSession() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return null
    }

    // Decrypt
    const session = await decrypt(sessionCookie.value)

    // Wenn die Session abgelaufen ist, löschen Cookie
    if (!session || session.expiresAt < Date.now()) {
      cookieStore.delete("session")
      return null
    }

    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

