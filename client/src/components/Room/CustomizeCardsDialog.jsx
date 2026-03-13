import React, { useState, useEffect, useRef } from 'react';
import { Layers, X, Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MIN_CARDS = 2;
const MAX_CARDS = 12;

const CustomizeCardsDialog = ({ isOpen, onClose, votingSystem, onSave }) => {
    const [localValues, setLocalValues] = useState([]);
    const [newValueInput, setNewValueInput] = useState('');
    const inputRef = useRef(null);

    // Reset local state whenever dialog opens
    useEffect(() => {
        if (isOpen) {
            setLocalValues(votingSystem?.values ? [...votingSystem.values] : []);
            setNewValueInput('');
        }
    }, [isOpen, votingSystem]);

    const canRemove = localValues.length > MIN_CARDS;
    const canAdd = localValues.length < MAX_CARDS;

    const handleRemove = (idx) => {
        if (!canRemove) return;
        setLocalValues(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAdd = () => {
        const trimmed = newValueInput.trim();
        if (!trimmed || !canAdd) return;
        // Prevent duplicates (string comparison)
        const alreadyExists = localValues.some(v => String(v) === trimmed);
        if (alreadyExists) {
            setNewValueInput('');
            return;
        }
        setLocalValues(prev => [...prev, trimmed]);
        setNewValueInput('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleSave = () => {
        onSave({
            votingSystem: {
                ...votingSystem,
                values: localValues,
            }
        });
        onClose();
    };

    const handleCancel = () => {
        setLocalValues(votingSystem?.values ? [...votingSystem.values] : []);
        setNewValueInput('');
        onClose();
    };

    const countColor =
        localValues.length <= MIN_CARDS
            ? 'text-destructive'
            : localValues.length >= MAX_CARDS
            ? 'text-amber-500'
            : 'text-muted-foreground';

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-8 bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                            <Layers className="size-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">Customize Cards</DialogTitle>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                {votingSystem?.name || 'Voting Scale'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                    {/* Current values */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Current Values
                            </Label>
                            <span className={`text-xs font-bold tabular-nums ${countColor}`}>
                                {localValues.length} / {MAX_CARDS}
                            </span>
                        </div>

                        {localValues.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-4">No values — add some below.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/30 border min-h-[48px]">
                                {localValues.map((val, idx) => (
                                    <span
                                        key={`${val}-${idx}`}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border shadow-sm text-sm font-bold"
                                    >
                                        {String(val)}
                                        <button
                                            onClick={() => handleRemove(idx)}
                                            disabled={!canRemove}
                                            className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-0.5"
                                            aria-label={`Remove ${val}`}
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {localValues.length <= MIN_CARDS && localValues.length > 0 && (
                            <p className="text-xs text-destructive font-medium">
                                Minimum {MIN_CARDS} cards required — cannot remove further.
                            </p>
                        )}
                        {localValues.length >= MAX_CARDS && (
                            <p className="text-xs text-amber-500 font-medium">
                                Maximum {MAX_CARDS} cards reached.
                            </p>
                        )}
                    </div>

                    {/* Add new value */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Add Value
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                value={newValueInput}
                                onChange={(e) => setNewValueInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. 21, ?, ☕"
                                disabled={!canAdd}
                                className="text-sm"
                                maxLength={10}
                            />
                            <Button
                                onClick={handleAdd}
                                disabled={!canAdd || !newValueInput.trim()}
                                size="sm"
                                className="shrink-0 font-bold gap-1"
                            >
                                <Plus className="size-4" />
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* Live preview */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Preview
                        </Label>
                        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-muted/20 border min-h-[44px]">
                            {localValues.length === 0 ? (
                                <span className="text-xs text-muted-foreground italic self-center">No cards to preview</span>
                            ) : (
                                localValues.map((val, idx) => (
                                    <span
                                        key={`preview-${val}-${idx}`}
                                        className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-md bg-background border shadow-sm text-xs font-black"
                                    >
                                        {String(val)}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/10">
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={localValues.length < MIN_CARDS}
                        className="font-bold"
                    >
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CustomizeCardsDialog;
