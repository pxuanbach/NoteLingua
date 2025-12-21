'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { PdfViewer } from '@/components/documents/pdf-viewer';
import { Sidebar } from '@/components/documents/sidebar';
import { AddEditVocabForm } from '@/components/vocabularies/add-edit-vocab-form';
import { Modal, Button, Loading, ConfirmModal } from '@/components/templates';
import { Document, Highlight, Vocab, SourceType, ReactPdfHighlight } from '@/types';
import { DocumentProvider, useDocumentContext } from '@/contexts/document-context';

interface DocumentDetailTemplateProps {
  document: Document;
}

export function DocumentDetailTemplate({ document }: DocumentDetailTemplateProps) {
  return (
    <DocumentProvider documentId={document._id}>
      <DocumentDetailContent document={document} />
    </DocumentProvider>
  );
}

function DocumentDetailContent({ document }: { document: Document }) {
  const router = useRouter();
  const { createHighlight, deleteHighlight, refetch } = useDocumentContext();

  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight>();
  const [tempSelection, setTempSelection] = useState<ReactPdfHighlight>();
  const [deleteId, setDeleteId] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);

  // Layout state
  const [showSidebar, setShowSidebar] = useState(true);

  // Handle new text selection
  const handleNewHighlight = useCallback((selection: ReactPdfHighlight) => {
    setTempSelection(selection);
    setEditingHighlight(undefined);
    setIsVocabModalOpen(true);
  }, []);

  // Handle edit request
  const handleEditRequest = useCallback((highlight: Highlight) => {
    setEditingHighlight(highlight);
    setTempSelection(undefined);
    setIsVocabModalOpen(true);
  }, []);

  // Handle delete request
  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteHighlight(deleteId);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
      setDeleteId(undefined);
    }
  };

  // Construct vocab object for form
  const vocabForForm = useMemo(() => {
    if (editingHighlight) {
      if (editingHighlight.vocab) {
        return {
          ...editingHighlight.vocab,
          source: document.file_name,
          source_type: SourceType.Document,
        };
      }
      return {
        _id: '',
        user_id: editingHighlight.user_id,
        word: editingHighlight.content?.text || '',
        meaning: '',
        source: document.file_name,
        source_type: SourceType.Document,
        created_at: new Date(),
      };
    }

    if (tempSelection) {
      return {
        _id: '',
        user_id: '',
        word: tempSelection.content?.text || '',
        meaning: '',
        source: document.file_name,
        source_type: SourceType.Document,
        created_at: new Date(),
      };
    }

    return undefined;
  }, [editingHighlight, tempSelection, document]);

  const handleVocabSuccess = async (vocab?: Vocab) => {
    if (tempSelection && vocab) {
      await createHighlight({
        vocab_id: vocab._id,
        document_id: document._id,
        file_hash: document.file_hash,
        ...tempSelection,
      });
    } else {
      refetch();
    }

    setIsVocabModalOpen(false);
    setTempSelection(undefined);
    setEditingHighlight(undefined);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/imports')}
            className="group cursor-pointer"
          >
            <svg
              className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          <h1 className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-sm tracking-tight">
            {document.file_name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={showSidebar ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-xs font-semibold cursor-pointer"
          >
            {showSidebar ? (
              <svg
                className="w-3.5 h-3.5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 min-h-0 relative">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={75} minSize={30}>
            <PdfViewer
              document={document}
              onHighlightEdit={handleEditRequest}
              onHighlightDelete={handleDeleteRequest}
              onNewHighlight={handleNewHighlight}
            />
          </Panel>

          {showSidebar && (
            <>
              <PanelResizeHandle className="w-1.5 hover:bg-primary/30 transition-colors bg-gray-50 dark:bg-gray-900 relative group">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200 dark:bg-gray-800 group-hover:bg-primary/50" />
              </PanelResizeHandle>
              <Panel defaultSize={25} minSize={20}>
                <Sidebar
                  onHighlightEdit={handleEditRequest}
                  onHighlightDelete={handleDeleteRequest}
                />
              </Panel>
            </>
          )}
        </PanelGroup>
      </main>

      {/* Vocab Form Modal */}
      <Modal
        isOpen={isVocabModalOpen}
        onClose={() => {
          setIsVocabModalOpen(false);
          setTempSelection(undefined);
        }}
        title={editingHighlight ? 'Update Word' : 'New Vocabulary'}
        size="lg"
      >
        <div className="p-1">
          {vocabForForm && (
            <AddEditVocabForm
              edit={!!editingHighlight?.vocab?._id}
              vocab={vocabForForm as Vocab}
              onSuccess={handleVocabSuccess}
            />
          )}
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Highlight?"
        message="This will permanently delete the highlighted phrase and its associated vocabulary from your list."
        confirmText="Remove"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
