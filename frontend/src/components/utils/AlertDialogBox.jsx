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
    openTrigger,
    title = "Are you sure?",
    desc,
    descCss,
    action,
    onAction,
    closeTitle = "Cancel",
    onClose,
}) {
    return (
        <AlertDialog>
            <AlertDialogTrigger type="Submit" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground text-3xl shadow-xs hover:bg-primary/85 h-10 rounded-md px-5 has-[>svg]:px-3">{openTrigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className={descCss}>
                        {desc}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} className="text-2xl">{closeTitle}</AlertDialogCancel>
                    {action && <AlertDialogAction onClick={onAction}>{action}</AlertDialogAction> }
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
