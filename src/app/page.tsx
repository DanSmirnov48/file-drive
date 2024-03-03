"use client";

import { FileCard } from "./file-card";
import { useQuery } from "convex/react";
import { UploadButton } from "./upload-button";
import { api } from "../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";

export default function Home() {

  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const { isLoaded: userLoaded, user } = useUser();
  let orgId: string | undefined = undefined;

  if (isOrgLoaded && userLoaded) {
    orgId = organization?.id ?? user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your Files</h1>
        <UploadButton />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {files?.map((file) => {
          return <FileCard key={file._id} file={file} />;
        })}
      </div>
    </main>
  );
}
