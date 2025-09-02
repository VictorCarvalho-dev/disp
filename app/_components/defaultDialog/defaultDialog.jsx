import DefaultDialogClient from "./defaultDialogClient";

export default function DefaultDialog({ title, description, button, children, open, onOpenChange }) {
    return (
        <DefaultDialogClient 
            title={title} 
            description={description} 
            button={button}
            open={open}
            onOpenChange={onOpenChange}
        >
            {children}
        </DefaultDialogClient>
    )
}