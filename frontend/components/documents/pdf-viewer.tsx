'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Loading, Button } from '@/components/templates';
import { useDocumentContext } from '@/contexts/document-context';
import { Document, Highlight, ReactPdfHighlight, HighlightContent } from '@/types';
import {
  PdfLoader,
  PdfHighlighter,
  TextHighlight,
  AreaHighlight,
  MonitoredHighlightContainer,
  useHighlightContainerContext,
} from 'react-pdf-highlighter-extended';

import type {
  Content,
  Highlight as IHighlight,
  GhostHighlight,
  PdfSelection,
  ViewportHighlight,
} from 'react-pdf-highlighter-extended';
import 'react-pdf-highlighter-extended/dist/esm/style/PdfHighlighter.css';

interface PdfViewerProps {
  document: Document;
  onHighlightEdit?: (highlight: Highlight) => void;
  onHighlightDelete?: (highlightId: string) => void;
  onNewHighlight?: (highlight: ReactPdfHighlight) => void;
}

// Selection tip component - follows library pattern exactly
function SelectionTipContent() {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-lg p-3 max-w-[280px] z-[9999] animate-in fade-in zoom-in duration-200">
      <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider opacity-70">
        Tip from library
      </div>
    </div>
  );
}

// Edit/Delete popup for existing highlights
function HighlightPopupContent({ highlight, onEdit, onDelete }: {
  highlight: Highlight;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-w-[300px] z-[1000] animate-in fade-in zoom-in duration-200">
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-xl text-primary">
            {highlight.vocab?.word || highlight.content?.text}
          </h3>
        </div>

        {highlight.vocab?.meaning && (
          <div className="mt-2 text-sm text-foreground leading-relaxed border-l-2 border-primary/20 pl-3">
            {highlight.vocab.meaning}
          </div>
        )}

        {highlight.vocab?.examples && highlight.vocab.examples.length > 0 && (
          <div className="mt-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Example</div>
            <p className="text-xs text-muted-foreground italic">
              "{highlight.vocab.examples[0]}"
            </p>
          </div>
        )}

        {highlight.vocab?.tags && highlight.vocab.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {highlight.vocab.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-border">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs h-8 items-center justify-center gap-1.5"
          onClick={onEdit}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="flex-1 text-xs h-8 items-center justify-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={onDelete}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </Button>
      </div>
    </div>
  );
}

export function PdfViewer({
  document: doc,
  onHighlightEdit,
  onHighlightDelete,
  onNewHighlight,
}: PdfViewerProps) {
  const { iHighlights, highlights, scrollToHighlight, scrollViewerTo } = useDocumentContext();

  const getFileUrl = useCallback(() => {
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${doc.file_name}`;
  }, [doc.file_name]);

  useEffect(() => {
    window.addEventListener('hashchange', scrollToHighlight, false);
    return () => {
      window.removeEventListener('hashchange', scrollToHighlight, false);
    };
  }, [scrollToHighlight]);

  const handleLoadingProgress = () => <Loading />;

  const handleSelection = useCallback((selection: PdfSelection) => {
    // Library handles tooltip via selectionTip
  }, []);

  const handleCreateGhostHighlight = useCallback((ghost: GhostHighlight) => {
    // Library handles tooltip via selectionTip
  }, []);

  const handleRemoveGhostHighlight = useCallback(() => {
    // Library handles cleanup
  }, []);

  // selectionTip prop - follows library pattern exactly
  const selectionTip = <SelectionTipContent />;

  return (
    <div className="h-full w-full bg-muted dark:bg-muted overflow-hidden relative">
      <PdfLoader document={getFileUrl()} beforeLoad={handleLoadingProgress}>
        {(pdfDocument) => (
          <PdfHighlighter
            pdfDocument={pdfDocument}
            enableAreaSelection={(event) => event.altKey}
            onScrollAway={() => {}}
            onSelection={handleSelection}
            onCreateGhostHighlight={handleCreateGhostHighlight}
            onRemoveGhostHighlight={handleRemoveGhostHighlight}
            selectionTip={selectionTip}
            highlights={iHighlights}
            utilsRef={(utils) => {
              if (scrollViewerTo) {
                scrollViewerTo.current = (highlight: IHighlight) => {
                  utils.scrollToHighlight(highlight);
                };
              }
            }}
          >
            <HighlightContainer
              highlights={highlights}
              onHighlightEdit={onHighlightEdit}
              onHighlightDelete={onHighlightDelete}
            />
          </PdfHighlighter>
        )}
      </PdfLoader>
    </div>
  );
}

function HighlightContainer({
  highlights,
  onHighlightEdit,
  onHighlightDelete,
}: {
  highlights: Highlight[];
  onHighlightEdit?: (highlight: Highlight) => void;
  onHighlightDelete?: (highlightId: string) => void;
}) {
  return (
    <HighlightCellRenderer
      highlights={highlights}
      onHighlightEdit={onHighlightEdit}
      onHighlightDelete={onHighlightDelete}
    />
  );
}

function HighlightCellRenderer({
  highlights,
  onHighlightEdit,
  onHighlightDelete,
}: {
  highlights: Highlight[];
  onHighlightEdit?: (highlight: Highlight) => void;
  onHighlightDelete?: (highlightId: string) => void;
}) {
  const containerContext = useHighlightContainerContext();
  const { highlight: viewportHighlight, isScrolledTo } = containerContext;

  const dbHighlight = highlights.find((h) => h._id === viewportHighlight.id);
  const [isHovered, setIsHovered] = useState(false);

  const isTextHighlight = !viewportHighlight.content?.image;

  const highlightTip = useMemo(() => {
    if (!isHovered || !dbHighlight) return undefined;
    return {
      position: viewportHighlight.position,
      content: (
        <HighlightPopupContent
          highlight={dbHighlight}
          onEdit={() => onHighlightEdit?.(dbHighlight)}
          onDelete={() => onHighlightDelete?.(dbHighlight._id)}
        />
      ),
    };
  }, [isHovered, dbHighlight, viewportHighlight.position, onHighlightEdit, onHighlightDelete]);

  return (
    <MonitoredHighlightContainer highlightTip={highlightTip}>
      {isTextHighlight ? (
        <div
          onMouseEnter={() => dbHighlight && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <TextHighlight
            highlight={viewportHighlight as ViewportHighlight}
            isScrolledTo={isScrolledTo}
          />
        </div>
      ) : (
        <div
          onMouseEnter={() => dbHighlight && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AreaHighlight
            highlight={viewportHighlight as ViewportHighlight}
            onChange={() => {}}
            isScrolledTo={isScrolledTo}
          />
        </div>
      )}
    </MonitoredHighlightContainer>
  );
}
