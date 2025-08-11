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
            <DialogContent className="sm:max-w-md md:items-center">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{desc}</DialogDescription>
                </DialogHeader>

                {content && content}

                <DialogFooter className="mt-2 md:mt-8">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            className="col-start-3 col-end-4 md:col-start-4 md:col-end-7 lg:col-start-5 lg:h-8"
                            size="ui"
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
