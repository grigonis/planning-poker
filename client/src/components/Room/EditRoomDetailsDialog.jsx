import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";

export default function EditRoomDetailsDialog({ isOpen, onClose, roomName, roomDescription, onSave }) {
  const [localName, setLocalName] = useState(roomName || '');
  const [localDesc, setLocalDesc] = useState(roomDescription || '');

  // Reset local state when dialog opens with fresh props
  useEffect(() => {
    if (isOpen) {
      setLocalName(roomName || '');
      setLocalDesc(roomDescription || '');
    }
  }, [isOpen, roomName, roomDescription]);

  const handleSave = () => {
    onSave({
      roomName: localName,
      roomDescription: localDesc
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-muted-foreground" />
            Edit Room Details
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              placeholder="Give your room a name..."
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              maxLength={50}
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {localName.length}/50
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this session about?"
              value={localDesc}
              onChange={(e) => setLocalDesc(e.target.value)}
              maxLength={200}
              className="resize-none h-24"
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {localDesc.length}/200
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
