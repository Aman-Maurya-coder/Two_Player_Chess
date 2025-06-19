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
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                    <AlertDialogCancel onClick={onClose} className="text-2xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onAction} className="text-2xl">{action}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
