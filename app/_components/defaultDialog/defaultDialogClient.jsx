"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function DefaultDialogClient({ 
    title, 
    description, 
    button, 
    children, 
    open: externalOpen, 
    onOpenChange: setExternalOpen 
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = externalOpen !== undefined;
    const open = isControlled ? externalOpen : internalOpen;
    const setOpen = isControlled ? setExternalOpen : setInternalOpen;

    // Sync internal state with external state when it changes
    useEffect(() => {
        if (isControlled) {
            setInternalOpen(externalOpen);
        }
    }, [externalOpen, isControlled]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {button && (
                <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                        {button}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}