'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loading, Button } from '@/components/templates';
import { useDocumentContext } from '@/contexts/document-context';
import { Document, Highlight, ReactPdfHighlight, HighlightContent } from '@/types';
import {
  PdfLoader,
  PdfHighlighter,
  Highlight as PDFHighlight,
  Popup,
  AreaHighlight,
} from 'react-pdf-highlighter';

import type { Content, IHighlight, NewHighlight, ScaledPosition } from 'react-pdf-highlighter';
import 'react-pdf-highlighter/dist/style.css';

interface PdfViewerProps {
  document: Document;
  onHighlightEdit?: (highlight: Highlight) => void;
  onHighlightDelete?: (highlightId: string) => void;
  onNewHighlight?: (highlight: ReactPdfHighlight) => void;
}

// SelectionTip component for new translations
const SelectionTip = ({ onConfirm, content }: { onConfirm: () => void; content: Content }) => (
  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 max-w-[240px] z-[1001] animate-in fade-in zoom-in duration-200">
    <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider opacity-70">
      Selected Text
    </div>
    <div className="text-sm font-medium line-clamp-4 mb-3 text-gray-900 dark:text-gray-100 italic leading-relaxed">
      "{content.text}"
    </div>
    <Button size="sm" className="w-full text-xs h-8 cursor-pointer" onClick={onConfirm}>
      Create Vocabulary
    </Button>
  </div>
);

const mapToIHighlight = (h: Highlight): IHighlight => ({
  id: h._id,
  comment: {
    text: h.vocab?.meaning || '',
    emoji: '',
  },
  content: h.content,
  position: h.position,
});

export function PdfViewer({
  document: doc,
  onHighlightEdit,
  onHighlightDelete,
  onNewHighlight,
}: PdfViewerProps) {
  const { highlights: contextHighlights, scrollToHighlight } = useDocumentContext();
  const [highlights, setHighlights] = useState<IHighlight[]>([]);
  const scrollViewerTo = useRef((highlight: IHighlight) => { });

  const getFileUrl = useCallback(() => {
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${doc.file_name}`;
  }, [doc.file_name]);

  useEffect(() => {
    setHighlights(contextHighlights.map(mapToIHighlight));
  }, [contextHighlights]);

  const parseIdFromHash = () => window.location.hash.slice('#highlight-'.length);

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  const scrollToHighlightFromHash = useCallback(() => {
    const hash = parseIdFromHash();
    const highlight = getHighlightById(hash);
    console.log('🚀 ~ PdfViewer ~ highlight:', highlight);
    if (highlight) {
      scrollViewerTo.current(highlight);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', scrollToHighlightFromHash, false);

    return () => {
      window.removeEventListener('hashchange', scrollToHighlightFromHash, false);
    };
  }, [scrollToHighlightFromHash]);

  const resetHash = () => {
    window.location.hash = '';
  };

  return (
    <div className="h-full w-full bg-gray-100 dark:bg-gray-950 overflow-hidden relative">
      <PdfLoader url={getFileUrl()} beforeLoad={<Loading />}>
        {(pdfDocument) => (
          <PdfHighlighter
            pdfDocument={pdfDocument}
            enableAreaSelection={(event) => event.altKey}
            onScrollChange={resetHash}
            scrollRef={(scrollTo) => {
              scrollViewerTo.current = scrollTo;
              scrollToHighlightFromHash();
            }}
            onSelectionFinished={(position, content, hideTipAndSelection, transformSelection) => {
              transformSelection();

              return (
                <SelectionTip
                  content={content}
                  onConfirm={() => {
                    if (content.text) {
                      onNewHighlight?.({ content: content as HighlightContent, position });
                      hideTipAndSelection();
                    }
                  }}
                />
              );
            }}
            highlightTransform={(
              highlight,
              index,
              setTip,
              hideTip,
              viewportToScaled,
              screenshot,
              isScrolledTo,
            ) => {
              console.log("🚀 ~ PdfViewer ~ isScrolledTo:", isScrolledTo)
              const isTextHighlight = !highlight.content?.image;

              const component = isTextHighlight ? (
                <PDFHighlight
                  isScrolledTo={isScrolledTo}
                  position={highlight.position}
                  comment={highlight.comment}
                />
              ) : (
                <AreaHighlight
                  isScrolledTo={isScrolledTo}
                  highlight={highlight}
                  onChange={(boundingRect) => { }}
                />
              );

              return (
                <Popup
                  popupContent={
                    <HighlightPopup
                      highlightId={highlight.id as string}
                      onEdit={onHighlightEdit}
                      onDelete={onHighlightDelete}
                    />
                  }
                  onMouseOver={(popupContent) => setTip(highlight, (highlight) => popupContent)}
                  onMouseOut={hideTip}
                  key={index}
                >
                  {component}
                </Popup>
              );
            }}
            highlights={highlights}
          />
        )}
      </PdfLoader>
    </div>
  );
}

function HighlightPopup({
  highlightId,
  onEdit,
  onDelete,
}: {
  highlightId: string;
  onEdit?: (h: Highlight) => void;
  onDelete?: (id: string) => void;
}) {
  const { highlights } = useDocumentContext();
  const highlight = highlights.find((h) => h._id === highlightId);

  if (!highlight) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4 min-w-[300px] z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-xl text-primary">
            {highlight.vocab?.word || highlight.content?.text}
          </h3>
        </div>

        {highlight.vocab?.meaning && (
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed border-l-2 border-primary/20 pl-3">
            {highlight.vocab.meaning}
          </div>
        )}

        {highlight.vocab?.examples && highlight.vocab.examples.length > 0 && (
          <div className="mt-3">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Example</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
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

      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs h-8"
          onClick={() => onEdit?.(highlight)}
        >
          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="flex-1 text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => onDelete?.(highlight._id)}
        >
          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </Button>
      </div>
    </div>
  );
}
