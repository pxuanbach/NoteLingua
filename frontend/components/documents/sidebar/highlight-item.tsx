'use client';

import { Button, Card, CardContent } from '@/components/templates';
import { Highlight } from '@/types';

interface HighlightItemProps {
  highlight: Highlight;
  onEdit: (highlight: Highlight) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export function HighlightItem({ highlight, onEdit, onDelete, onClick }: HighlightItemProps) {
  const vocab = highlight.vocab;

  if (!vocab) return <></>;

return (
    <div
      className="cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <p className="text-sm text-foreground mb-2">{highlight.content.text}</p>
      <p className="text-sm text-muted-foreground">{vocab.meaning}</p>
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground mt-2">
        Page {highlight.position.boundingRect.pageNumber}
      </span>
      {vocab.examples && vocab.examples.length > 0 && (
        <p className="text-xs text-muted-foreground italic mt-2">Examples: {vocab.examples[0]}</p>
      )}
    </div>
  );
}
