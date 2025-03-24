import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getUsername, logout } from "@/lib/actions"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function WelcomePage() {
  const username = await getUsername()

  // If no username is found, redirect to login page
  if (!username) {
    redirect("/")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome, {username}!</CardTitle>
          <CardDescription>You have successfully logged in</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Rules: </p>
          <p className="text-center py-4">1. You can paint one pixel every minute</p>
          <p className="text-center py-4">Click Play to start drawing.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <form action={logout}>
            <Button type="submit" variant="outline">
              Logout
            </Button>
          </form>
          <Link href="/canvas">
            <Button variant="ghost">Play</Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}

