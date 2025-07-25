import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function AlertDialogBox({ 
    dialogOpen,
    setDialogOpen,
    title = "Are you sure?",
    desc,
    action,
    onAction,
    onClose,
}) {
    return (
        <AlertDialog open={dialogOpen} onOpenChange={(open) => {
            if (!open) {
                setDialogOpen(false); // Only close the dialog when it is explicitly closed
            }
        }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="">
                        {desc}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {/* <AlertDialogCancel onClick={onClose} className="text-2xl">Cancel</AlertDialogCancel> */}
                    <AlertDialogCancel asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="text-base font-poppins font-medium"
                            size="sm"
                            {...(onClose && { onClick: onClose })}
                        >
                            Cancel
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onAction} className="text-base font-poppins font-medium bg-destructive">{action}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
