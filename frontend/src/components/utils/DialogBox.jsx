import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function DialogBox({
    dialogOpen,
    setDialogOpen,
    title,
    desc,
    content,
    onClose,
}) {
    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => {
            if (!open) {
                setDialogOpen(false); // Only close the dialog when it is explicitly closed
                if (onClose) onClose(); // Call the onClose handler if provided
            }
        }}> 
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{desc}</DialogDescription>
                </DialogHeader>

                {content && content}

                <DialogFooter className="sm:justify-end">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            className="text-2xl h-fit rounded-full"
                            size="md"
                            {...(onClose && { onClick: onClose })}
                        >
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
