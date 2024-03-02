'use client'

import { Button } from "@/components/ui/button";
import { SignInButton, SignOutButton, SignedIn, SignedOut, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {

  const { organization, isLoaded: isOrgLoaded } = useOrganization()
  const { isLoaded: userLoaded, user } = useUser()

  let orgId = null

  if (isOrgLoaded && userLoaded) {
    orgId = organization?.id ?? user?.id
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip")
  const createFile = useMutation(api.files.createFile)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {files?.map(file => {
        return <div key={file._id}>{file.name}</div>
      })}

      <Button onClick={() => {
        if (!orgId) return
        createFile({
          name: `test file ${Math.random()}`,
          orgId
        })
      }}>Click me</Button>
    </main>
  );
}
