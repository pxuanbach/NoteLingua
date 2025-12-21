'use client';

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useDocumentHighlights } from '@/hooks/use-document-highlights';
import { CreateHighlightRequest, Highlight, UpdateHighlightRequest } from '@/types';

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
  scrollToHighlight: (id: string) => void;
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

  const scrollToHighlight = useCallback((id: string) => {
    window.location.hash = `highlight-${id}`;
  }, []);

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
