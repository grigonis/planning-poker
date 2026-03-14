import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard } from 'lucide-react';

const KeyboardShortcutsDialog = ({ isOpen, onClose, isHost }) => {
    const shortcuts = [
        { key: '1-9', desc: 'Select card 1-9' },
        { key: 'T', desc: 'Toggle Tasks pane' },
        { key: 'I', desc: 'Open Invite modal' },
        { key: 'S', desc: 'Open Settings' },
    ];

    if (isHost) {
        shortcuts.push(
            { key: 'R', desc: 'Reveal votes' },
            { key: 'N', desc: 'New round / Reset' }
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xs">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="size-5 text-primary" />
                        Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>
                        Speed up your planning session
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-2">
                    {shortcuts.map((s) => (
                        <div key={s.key} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">{s.desc}</span>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                {s.key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default KeyboardShortcutsDialog;
