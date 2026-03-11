import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, ListPlus, Plus, Trash2, 
    CheckCircle2, Circle, PlayCircle, 
    MoreVertical, ChevronRight, LayoutList 
} from 'lucide-react';

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
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-[65px] bottom-0 w-full max-w-sm z-30 bg-white/90 dark:bg-[#0c0c0c]/90 backdrop-blur-3xl border-l border-gray-200 dark:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col pt-2"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10 dark:bg-banana-500/10 text-orange-500 dark:text-banana-500">
                                <LayoutList size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Session Tasks</h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Task Stats Brief */}
                    <div className="px-6 py-4 flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        <span>Total: {tasks.length}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                        <span>Completed: {tasks.filter(t => t.status === 'COMPLETED').length}</span>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                        <div className="space-y-3">
                            <AnimatePresence initial={false}>
                                {tasks.map((task) => {
                                    const isSelected = activeTaskId === task.id;
                                    const isCompleted = task.status === 'COMPLETED';
                                    const isVoting = task.status === 'VOTING';

                                    return (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`group p-4 rounded-xl border transition-all duration-300 relative
                                                ${isSelected 
                                                    ? 'bg-orange-50/50 dark:bg-banana-500/5 border-orange-500/30 dark:border-banana-500/30' 
                                                    : 'bg-white/50 dark:bg-white/[0.03] border-gray-100 dark:border-white/5 hover:border-orange-500/20 dark:hover:border-banana-500/20'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1">
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="text-green-500 w-5 h-5" />
                                                    ) : isVoting ? (
                                                        <PlayCircle className="text-orange-500 dark:text-banana-500 w-5 h-5 animate-pulse" />
                                                    ) : (
                                                        <Circle className="text-gray-300 dark:text-gray-600 w-5 h-5" />
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-semibold text-sm leading-tight truncate
                                                        ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                                                        {task.title}
                                                    </h3>
                                                    {isCompleted && (
                                                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                                                            Score: {task.votes}
                                                        </span>
                                                    )}
                                                    {isVoting && (
                                                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 dark:bg-banana-500/10 text-orange-500 dark:text-banana-500 text-[10px] font-bold uppercase tracking-wider pulse">
                                                            Currently Voting
                                                        </span>
                                                    )}
                                                </div>

                                                {isHost && (
                                                    <div className="flex flex-col gap-2 items-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!isCompleted && !isVoting && (
                                                            <button 
                                                                onClick={() => onSelectTask(task.id)}
                                                                className="p-1.5 rounded-lg bg-orange-100 dark:bg-banana-500/20 text-orange-600 dark:text-banana-500 hover:scale-105 transition-transform"
                                                                title="Vote on this task"
                                                            >
                                                                <ChevronRight size={16} />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => onDeleteTask(task.id)}
                                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {tasks.length === 0 && (
                                <div className="py-12 flex flex-col items-center justify-center text-center opacity-30 px-6">
                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 mb-4 flex items-center justify-center">
                                        <Plus size={24} />
                                    </div>
                                    <p className="text-sm font-medium">No tasks added yet.<br/>Start by adding your first one below.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Controls */}
                    {isHost && (
                        <div className="p-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5">
                            {showBulkAdd ? (
                                <form onSubmit={handleBulkSubmit} className="space-y-3">
                                    <textarea
                                        value={bulkText}
                                        onChange={(e) => setBulkText(e.target.value)}
                                        placeholder="Paste tasks here (one per line)..."
                                        className="w-full h-32 p-3 text-sm bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-orange-500 dark:focus:border-banana-500 transition-all font-medium placeholder:text-gray-400"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            type="submit"
                                            className="flex-1 bg-orange-500 dark:bg-banana-500 text-white dark:text-dark-900 text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                                        >
                                            Import Tasks
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setShowBulkAdd(false)}
                                            className="px-4 py-2.5 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white text-sm font-bold rounded-xl"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    <form onSubmit={handleSingleSubmit} className="relative">
                                        <input 
                                            type="text"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            placeholder="Enter task title..."
                                            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-orange-500 dark:focus:border-banana-500 transition-all font-semibold placeholder:text-gray-400"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={!newTaskTitle.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-500 dark:bg-banana-500 text-white dark:text-dark-900 rounded-lg hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </form>
                                    <button 
                                        onClick={() => setShowBulkAdd(true)}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-gray-500 hover:text-orange-500 dark:hover:text-banana-500 hover:border-orange-500 focus:outline-none transition-all text-sm font-bold"
                                    >
                                        <ListPlus size={18} />
                                        Bulk Add Tasks
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TasksPane;
