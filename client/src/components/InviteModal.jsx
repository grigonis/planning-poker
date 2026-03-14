import React, { useState } from 'react';
import { Copy, Check, LinkIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const InviteModal = ({ isOpen, onClose, roomId }) => {
    const [copied, setCopied] = useState(false);
    const inviteLink = `${window.location.origin}/room/${roomId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => {
            setCopied(false);
            onClose();
        }, 400);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader className="flex flex-col items-center text-center gap-4">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <LinkIcon className="size-6" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Invite Team</DialogTitle>
                    <DialogDescription className="text-sm">
                        Share this link with your team to let them join this session.
                    </DialogDescription>
                </DialogHeader>

                <div className="w-full flex items-center gap-2 mt-2 p-1.5 bg-muted/50 border rounded-xl">
                    <div className="flex-1 px-3 py-2 text-sm text-muted-foreground truncate font-mono">
                        {inviteLink}
                    </div>
                    <Button
                        size="icon"
                        onClick={handleCopy}
                        variant={copied ? "secondary" : "default"}
                        className={copied ? "text-green-500" : ""}
                    >
                        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InviteModal;
