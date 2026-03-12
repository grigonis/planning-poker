import React, { useState } from 'react';
import { 
    ListPlus, Plus, Trash2, 
    CheckCircle2, Circle, PlayCircle, 
    ChevronRight, LayoutList 
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

const TasksPane = ({ 
    isOpen, 
    onClose, 
    tasks = [], 
    activeTaskId, 
    isHost = false,
    onCreateTask, 
    onBulkCreate, 
    onDeleteTask, 
    onSelectTask 
}) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [showBulkAdd, setShowBulkAdd] = useState(false);
    const [bulkText, setBulkText] = useState('');

    const handleSingleSubmit = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        onCreateTask(newTaskTitle);
        setNewTaskTitle('');
    };

    const handleBulkSubmit = (e) => {
        e.preventDefault();
        if (!bulkText.trim()) return;
        onBulkCreate(bulkText);
        setBulkText('');
        setShowBulkAdd(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col gap-0 border-l border-border bg-background/95 backdrop-blur-xl">
                {/* Header */}
                <SheetHeader className="p-6 border-b border-border space-y-0 flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <LayoutList size={20} />
                        </div>
                        <SheetTitle className="text-xl font-bold">Session Tasks</SheetTitle>
                    </div>
                </SheetHeader>

                {/* Task Stats Brief */}
                <div className="px-6 py-4 flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Total: {tasks.length}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>Completed: {tasks.filter(t => t.status === 'COMPLETED').length}</span>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                    <div className="space-y-3">
                        {tasks.map((task) => {
                            const isSelected = activeTaskId === task.id;
                            const isCompleted = task.status === 'COMPLETED';
                            const isVoting = task.status === 'VOTING';

                            return (
                                <div
                                    key={task.id}
                                    className={`group p-4 rounded-xl border transition-all duration-300 relative
                                        ${isSelected 
                                            ? 'bg-primary/5 border-primary/30' 
                                            : 'bg-card/50 border-border hover:border-primary/20'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {isCompleted ? (
                                                <CheckCircle2 className="text-green-500 w-5 h-5" />
                                            ) : isVoting ? (
                                                <PlayCircle className="text-primary w-5 h-5 animate-pulse" />
                                            ) : (
                                                <Circle className="text-muted-foreground/30 w-5 h-5" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-semibold text-sm leading-tight truncate
                                                ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                {task.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-1.5">
                                                {isCompleted && (
                                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none text-[10px] font-bold uppercase tracking-wider">
                                                        Score: {task.votes}
                                                    </Badge>
                                                )}
                                                {isVoting && (
                                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none text-[10px] font-bold uppercase tracking-wider pulse">
                                                        Currently Voting
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {isHost && (
                                            <div className="flex flex-col gap-2 items-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isCompleted && !isVoting && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => onSelectTask(task.id)}
                                                        className="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
                                                        title="Vote on this task"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDeleteTask(task.id)}
                                                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {tasks.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center text-center opacity-30 px-6">
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground mb-4 flex items-center justify-center">
                                    <Plus size={24} />
                                </div>
                                <p className="text-sm font-medium text-foreground">No tasks added yet.<br/>Start by adding your first one below.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                {isHost && (
                    <div className="p-6 bg-muted/30 border-t border-border mt-auto">
                        {showBulkAdd ? (
                            <form onSubmit={handleBulkSubmit} className="space-y-3">
                                <Textarea
                                    value={bulkText}
                                    onChange={(e) => setBulkText(e.target.value)}
                                    placeholder="Paste tasks here (one per line)..."
                                    className="h-32 bg-background"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <Button 
                                        type="submit"
                                        className="flex-1 font-bold"
                                    >
                                        Import Tasks
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowBulkAdd(false)}
                                        className="font-bold"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-3">
                                <form onSubmit={handleSingleSubmit} className="relative">
                                    <Input 
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="Enter task title..."
                                        className="pr-12 h-12 bg-background font-semibold"
                                    />
                                    <Button 
                                        type="submit"
                                        size="icon"
                                        disabled={!newTaskTitle.trim()}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9"
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </form>
                                <Button 
                                    variant="outline"
                                    onClick={() => setShowBulkAdd(true)}
                                    className="w-full flex items-center justify-center gap-2 h-12 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary font-bold"
                                >
                                    <ListPlus size={18} />
                                    Bulk Add Tasks
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default TasksPane;
