'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import { useDocumentHighlights } from '@/hooks/use-document-highlights';
import { CreateHighlightRequest, Highlight, UpdateHighlightRequest } from '@/types';
import { IHighlight } from 'react-pdf-highlighter-extended';
import { mapHighlightToIHighlight } from '@/utils/mapDataTo';

interface DocumentContextType {
  highlights: Highlight[];
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  hasMore: boolean;
  refetch: () => void;
  createHighlight: (data: CreateHighlightRequest) => Promise<void>;
  updateHighlight: (id: string, data: UpdateHighlightRequest) => Promise<boolean>;
  deleteHighlight: (id: string) => Promise<boolean>;
  scrollToHighlight: () => void;
  scrollViewerTo: React.RefObject<(highlight: IHighlight) => void>;
  iHighlights: IHighlight[];
  updateHash: (id: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({
  children,
  documentId,
}: {
  children: ReactNode;
  documentId: string;
}) {
  const {
    highlights,
    loading,
    error,
    loadMore,
    hasMore,
    refetch,
    createHighlight,
    updateHighlight,
    deleteHighlight
  } = useDocumentHighlights(documentId);
  const scrollViewerTo = useRef((highlight: IHighlight) => { });
  const [iHighlights, setIHighlights] = useState<IHighlight[]>([]);

  const parseIdFromHash = () => window.location.hash.slice('#highlight-'.length);

  const updateHash = (id: string) => {
    document.location.hash = `highlight-${id}`;
  };

  const getHighlightById = (id: string) => {
    return iHighlights.find((highlight) => highlight.id === id);
  };

  const scrollToHighlight = useCallback(() => {
    const highlight = getHighlightById(parseIdFromHash());
    if (highlight) {
      scrollViewerTo.current(highlight);
    }
  }, []);

  useEffect(() => {
    setIHighlights(highlights.map(mapHighlightToIHighlight));
  }, [highlights]);

  return (
    <DocumentContext.Provider
      value={{
        highlights,
        loading,
        error,
        loadMore,
        hasMore,
        refetch,
        createHighlight,
        updateHighlight,
        deleteHighlight,
        scrollToHighlight,
        scrollViewerTo: scrollViewerTo,
        iHighlights,
        updateHash, // update hash to scroll to specific highlight
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
}
