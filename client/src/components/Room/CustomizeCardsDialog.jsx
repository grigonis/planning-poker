import React from 'react';
import { Layers } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";

const CustomizeCardsDialog = ({ isOpen, onClose }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-8 bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                            <Layers className="size-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">Customize Cards</DialogTitle>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Voting System</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="text-center py-8 space-y-3">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <Layers className="size-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                            Card customization is coming soon. You'll be able to choose presets and create custom voting scales here.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CustomizeCardsDialog;
