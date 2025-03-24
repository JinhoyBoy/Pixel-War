import { getUsername } from "@/lib/actions"
import { redirect } from "next/navigation"
import { CanvasClient } from "@/components/canvas-client"

export default async function CanvasPage() {
  const username = await getUsername()

  // If no username is found, redirect to login page
  if (!username) {
    redirect("/")
  }

  return <CanvasClient username={username} />
}

