"use client";

import Image from "next/image";
import { FileIcon, Loader2, StarIcon } from "lucide-react";
import { FileCard } from "./file-card";
import { useQuery } from "convex/react";
import { UploadButton } from "./upload-button";
import { api } from "../../../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { SearchBar } from "./search-bar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Placeholder() {
  return (
    <div className="flex flex-col gap-8 w-full items-center mt-24">
      <Image
        alt="an image of a picture and directory icon"
        width="300"
        height="300"
        src="/empty.svg"
      />
      <div className="text-2xl">You have no files, upload one now</div>
      <UploadButton />
    </div>
  );
}

export function FileBrowser({
  title,
  favoritesOnly,
  deletedOnly,
}: {
  title: string;
  favoritesOnly?: boolean;
  deletedOnly?: boolean;
}) {

  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const { isLoaded: userLoaded, user } = useUser();
  const [query, setQuery] = useState("")
  let orgId: string | undefined = undefined;

  if (isOrgLoaded && userLoaded) {
    orgId = organization?.id ?? user?.id;
  }

  const favorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : "skip"
  );

  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, query, favorites: favoritesOnly, deletedOnly  } : "skip"
  );
  const isLoading = files === undefined;

  return (
    <div>
      <div>
        {isLoading && (
          <div className="flex flex-col gap-8 w-full items-center mt-24">
            <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
            <div className="text-2xl">Loading your images...</div>
          </div>
        )}

        {!isLoading && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold">{title}</h1>

              <SearchBar query={query} setQuery={setQuery} />
              <UploadButton />
            </div>

            {files.length === 0 && <Placeholder />}

            <div className="grid grid-cols-3 gap-4">
              {files?.map((file) => {
                return (
                  <FileCard
                    favorites={favorites ?? []}
                    key={file._id}
                    file={file}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>

  );
}
