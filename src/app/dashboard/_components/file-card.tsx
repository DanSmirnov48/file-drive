import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    FileTextIcon,
    GanttChartIcon,
    ImageIcon,
    MoreVertical,
    StarHalf,
    StarIcon,
    TrashIcon,
    UndoIcon,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReactNode, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";


function FileCardActions({
    file,
    isFavorited,
}: {
    file: Doc<"files">;
    isFavorited: boolean;
}) {
    const { toast } = useToast();
    const deleteFile = useMutation(api.files.deleteFile);
    const restoreFile = useMutation(api.files.restoreFile);
    const toggleFavorite = useMutation(api.files.toggleFavorite);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the file for our deletion process. Files are
                            deleted periodically
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                await deleteFile({
                                    fileId: file._id,
                                });
                                toast({
                                    variant: "default",
                                    title: "File marked for deletion",
                                    description: "Your file will be deleted soon",
                                });
                            }}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MoreVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        onClick={() => {
                            toggleFavorite({
                                fileId: file._id,
                            });
                        }}
                        className="flex gap-1 items-center cursor-pointer"
                    >
                        {isFavorited ? (
                            <div className="flex gap-1 items-center">
                                <StarIcon className="w-4 h-4" /> Unfavorite
                            </div>
                        ) : (
                            <div className="flex gap-1 items-center">
                                <StarHalf className="w-4 h-4" /> Favorite
                            </div>
                        )}
                    </DropdownMenuItem>
                    <Protect role="org:admin" fallback={<></>}>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                if (file.shouldDelete) {
                                    restoreFile({
                                        fileId: file._id
                                    })
                                } else {
                                    setIsConfirmOpen(true);
                                }
                            }}
                            className="flex gap-1 items-center cursor-pointer"
                        >
                            {file.shouldDelete ? (
                                <div className="flex gap-1 text-green-600 items-center cursor-pointer">
                                    <UndoIcon className="w-4 h-4" /> Restore
                                </div>
                            ) : (
                                <div className="flex gap-1 text-red-600 items-center cursor-pointer">
                                    <TrashIcon className="w-4 h-4" /> Delete
                                </div>
                            )}
                        </DropdownMenuItem>
                    </Protect>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
function getFileUrl(fileId: Id<"_storage">): string {
    return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

export function FileCard({
    file,
    favorites,
}: {
    file: Doc<"files">;
    favorites: Doc<"favorites">[];
}) {
    const typeIcons = {
        image: <ImageIcon />,
        pdf: <FileTextIcon />,
        csv: <GanttChartIcon />,
    } as Record<Doc<"files">["type"], ReactNode>;

    const isFavorited = favorites.some(
        (favorite) => favorite.fileId === file._id
    );

    return (
        <Card>
            <CardHeader className="relative">
                <CardTitle className="flex gap-2">
                    <div className="flex justify-center">{typeIcons[file.type]}</div>{" "}
                    {file.name}
                </CardTitle>
                <div className="absolute top-2 right-2">
                    <FileCardActions isFavorited={isFavorited} file={file} />
                </div>
            </CardHeader>
            <CardContent className="h-[200px] flex justify-center items-center">
                {file.type === "image" && (
                    <Image
                        alt={file.name}
                        width="300"
                        height="200"
                        src={getFileUrl(file.fileId)}
                        className="rounded-lg"
                    />
                )}

                {file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
                {file.type === "pdf" && <FileTextIcon className="w-20 h-20" />}
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button
                    onClick={() => {
                        window.open(getFileUrl(file.fileId), "_blank");
                    }}
                >
                    Download
                </Button>
            </CardFooter>
        </Card>
    );
}