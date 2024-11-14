'use client'

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserProfile() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    return <div>Access Denied</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Data extracted from the session object</h1>
      <p className="text-sm mb-5">You can access to this user&apos;s information from the session object. </p>
        <ul className="list-disc pl-5 text-sm">
          <li>User ID: session?.user?.id</li>
          <li>Name: session?.user?.name</li>
          <li>Email: session?.user?.email</li>
          <li>Image: session?.user?.image</li>
          <li>Subscription Plan: session?.user?.subscriptionPlan</li>
        </ul>
        <br></br>
        <p className="text-sm mb-5">This data is stored in the session cookie and can be accessed on the client side.</p>
        <p className="text-sm">You can remove this page. It is only for demonstration purposes.</p>
      <hr className="my-5" />
      <div className="flex items-center space-x-4 mb-4">
        <Avatar>
          <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
          <AvatarFallback>{session?.user?.name?.charAt(0) || ''}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{session?.user?.name}</p>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {session?.user?.id}</p>
        <p><strong>Subscription Plan:</strong> {session?.user?.subscriptionPlan}</p>
      </div>
    </div>
  )
}