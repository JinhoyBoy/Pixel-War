"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(username) {
  // Set a cookie with the username
  const cookieStore = await cookies()
  cookieStore.set("username", username, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: "strict",
  })

  // The redirect will happen in the client component after this action completes
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("username")
  redirect("/")
}

export async function getUsername() {
  const cookieStore = await cookies()
  return cookieStore.get("username")?.value
}
