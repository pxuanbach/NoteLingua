'use client';

import { useState } from 'react';
import { Button } from '@/components/templates';
import { Highlight } from '@/types';

interface HighlightActionsProps {
  highlight: Highlight;
  onEdit: (highlight: Highlight) => void;
  onDelete: (id: string) => Promise<boolean>;
  className?: string;
}

export function HighlightActions({
  highlight,
  onEdit,
  onDelete,
  className,
}: HighlightActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEdit = () => {
    onEdit(highlight);
  };

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const success = await onDelete(highlight._id);
      if (success) {
        setShowConfirm(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
        <p className="text-sm">Delete this highlight?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <Button variant="ghost" size="sm" onClick={handleEdit}>
        <div title="Edit">✏️</div>
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDelete}>
        <div title="Delete">🗑️</div>
      </Button>
    </div>
  );
}
