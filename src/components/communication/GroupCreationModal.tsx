import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';

interface GroupCreationModalProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, description: string, memberIds: string[]) => void;
  selectedMembers: string[];
  memberNames: string[];
}

export const GroupCreationModal: React.FC<GroupCreationModalProps> = ({
  open,
  onClose,
  onCreateGroup,
  selectedMembers,
  memberNames
}) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      onCreateGroup(groupName.trim(), description.trim(), selectedMembers);
      onClose();
      setGroupName('');
      setDescription('');
    }
  };

  const handleClose = () => {
    onClose();
    setGroupName('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Group Chat
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name *</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Members ({selectedMembers.length} selected)</Label>
            <div className="p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
              {memberNames.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {memberNames.map((name, index) => (
                    <span
                      key={index}
                      className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No members selected</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!groupName.trim() || selectedMembers.length === 0}
              className="flex-1"
            >
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};