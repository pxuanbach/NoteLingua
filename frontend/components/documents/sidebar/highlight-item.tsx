'use client';

import { Card, CardContent } from '@/components/templates';
import { HighlightActions } from './highlight-actions';
import { Highlight } from '@/types';

interface HighlightItemProps {
  highlight: Highlight;
  onEdit: (highlight: Highlight) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export function HighlightItem({ highlight, onEdit, onDelete }: HighlightItemProps) {
  const vocab = highlight.vocab;

  if (!vocab) return <></>;

  return (
    <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <CardContent className="p-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 px-2">
            <div className="flex flex-row mt-1 py-1 gap-1">
              <p className="text-sm text-blue-700 dark:text-blue-400">{vocab.word}:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{vocab.meaning}</p>
            </div>
            {Array.isArray(vocab.tags) && vocab.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {vocab.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {vocab.examples && vocab.examples.length > 0 && (
              <div className="mt-2 px-2 py-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">Examples:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {vocab.examples.map((example, index) => (
                    <li key={index} className="text-xs text-gray-600 dark:text-gray-400">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <HighlightActions highlight={highlight} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
