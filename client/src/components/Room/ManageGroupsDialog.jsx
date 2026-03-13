import React, { useState } from 'react';
import { Users, Plus, Trash2, UserPlus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ManageGroupsDialog = ({
    isOpen,
    onClose,
    groups = [],           // Array<{ id, name, color }>
    groupsEnabled = false,
    users = [],            // Array<UserObject> — full room user list
    currentUser,
    onToggleGroups,        // (enabled: boolean) => void
    onCreateGroup,         // (name: string) => void
    onDeleteGroup,         // (groupId: string) => void
    onAssignGroup,         // (targetUserId: string, groupId: string | null) => void
}) => {
    const [newGroupName, setNewGroupName] = useState('');

    const handleCreate = () => {
        const trimmed = newGroupName.trim();
        if (!trimmed) return;
        onCreateGroup(trimmed);
        setNewGroupName('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreate();
        }
    };

    // Non-spectator users only
    const assignableUsers = users.filter(u => u.role !== 'SPECTATOR');

    // Build a map: groupId -> users in that group
    const membersByGroup = {};
    groups.forEach(g => { membersByGroup[g.id] = []; });
    assignableUsers.forEach(u => {
        if (u.groupId && membersByGroup[u.groupId]) {
            membersByGroup[u.groupId].push(u);
        }
    });
    const unassigned = assignableUsers.filter(u => !u.groupId || !groups.find(g => g.id === u.groupId));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-8 bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                            <Users className="size-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">Manage Groups</DialogTitle>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                Group users and view their results separately
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                    {/* Enable Groups toggle */}
                    <div className="flex items-center justify-between gap-4 p-4 rounded-3xl border border-transparent hover:border-border hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-2xl shrink-0 transition-colors ${groupsEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <Users className="size-5" />
                            </div>
                            <div className="mt-0.5">
                                <Label htmlFor="groupsEnabledSwitch" className="font-bold text-sm mb-1 cursor-pointer">
                                    Enable Groups
                                </Label>
                                <p className="text-[13px] text-muted-foreground leading-snug">
                                    Split participants into named groups and see voting results broken down per group.
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="groupsEnabledSwitch"
                            checked={groupsEnabled}
                            onCheckedChange={onToggleGroups}
                        />
                    </div>

                    {groupsEnabled && (
                        <>
                            {/* Create new group */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Create New Group
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="e.g. Frontend, Backend, QA…"
                                        className="text-sm"
                                        maxLength={32}
                                    />
                                    <Button
                                        onClick={handleCreate}
                                        disabled={!newGroupName.trim()}
                                        size="sm"
                                        className="shrink-0 font-bold gap-1"
                                    >
                                        <Plus className="size-4" />
                                        Create
                                    </Button>
                                </div>
                            </div>

                            {/* Groups list */}
                            {groups.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground text-sm italic">
                                    No groups yet — create one above.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        Groups
                                    </Label>
                                    {groups.map(group => {
                                        const members = membersByGroup[group.id] || [];
                                        return (
                                            <GroupRow
                                                key={group.id}
                                                group={group}
                                                members={members}
                                                assignableUsers={assignableUsers}
                                                onDelete={() => onDeleteGroup(group.id)}
                                                onAssign={(userId, gId) => onAssignGroup(userId, gId)}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {/* Unassigned users */}
                            {assignableUsers.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        Unassigned Participants
                                    </Label>
                                    {unassigned.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">All participants are assigned to a group.</p>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {unassigned.map(user => (
                                                <UnassignedUserRow
                                                    key={user.id}
                                                    user={user}
                                                    groups={groups}
                                                    onAssign={(gId) => onAssignGroup(user.id, gId)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t bg-muted/10">
                    <Button variant="outline" onClick={onClose}>
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------

function GroupRow({ group, members, assignableUsers, onDelete, onAssign }) {
    return (
        <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3">
            {/* Group header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: group.color }}
                    />
                    <span className="font-bold text-sm">{group.name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {members.length} {members.length === 1 ? 'member' : 'members'}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={onDelete}
                    aria-label={`Delete group ${group.name}`}
                >
                    <Trash2 className="size-3.5" />
                </Button>
            </div>

            {/* Member list */}
            {members.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {members.map(u => (
                        <div
                            key={u.id}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                            style={{ borderColor: group.color + '40', backgroundColor: group.color + '15', color: group.color }}
                        >
                            <span>{u.name}</span>
                            {/* Unassign button */}
                            <button
                                onClick={() => onAssign(u.id, null)}
                                className="opacity-60 hover:opacity-100 transition-opacity"
                                aria-label={`Remove ${u.name} from group`}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add user to group */}
            <AddToGroupSelect
                groupId={group.id}
                assignableUsers={assignableUsers.filter(u => u.groupId !== group.id)}
                onAssign={(userId) => onAssign(userId, group.id)}
            />
        </div>
    );
}

function AddToGroupSelect({ groupId, assignableUsers, onAssign }) {
    const [value, setValue] = useState('');

    if (assignableUsers.length === 0) return null;

    const handleChange = (userId) => {
        if (!userId) return;
        onAssign(userId);
        setValue('');
    };

    return (
        <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="h-8 text-xs text-muted-foreground border-dashed">
                <div className="flex items-center gap-1.5">
                    <UserPlus className="size-3" />
                    <SelectValue placeholder="Add participant…" />
                </div>
            </SelectTrigger>
            <SelectContent>
                {assignableUsers.map(u => (
                    <SelectItem key={u.id} value={u.id} className="text-sm">
                        {u.name}
                        {u.groupId && <span className="ml-1 text-muted-foreground text-xs">(move)</span>}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function UnassignedUserRow({ user, groups, onAssign }) {
    return (
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-dashed border-border bg-muted/10">
            <span className="text-sm font-medium truncate">{user.name}</span>
            <Select onValueChange={(gId) => onAssign(gId)}>
                <SelectTrigger className="h-7 w-36 text-xs">
                    <SelectValue placeholder="Assign group…" />
                </SelectTrigger>
                <SelectContent>
                    {groups.map(g => (
                        <SelectItem key={g.id} value={g.id} className="text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                                {g.name}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export default ManageGroupsDialog;
