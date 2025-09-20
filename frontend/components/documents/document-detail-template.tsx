'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { PDFViewer } from '@/components/documents/pdf-viewer';
import { HighlightsSidebar } from '@/components/documents/sidebar/highlights-sidebar';
import { AddEditVocabForm } from '@/components/vocabularies/add-edit-vocab-form';
import { Button, FloatingButton, Loading, Modal } from '@/components/templates';
import { Document, Highlight, Vocab, SourceType } from '@/types';
import { useDocumentHighlights } from '@/hooks/use-document-highlights';

interface DocumentDetailTemplateProps {
  document: Document;
}

export function DocumentDetailTemplate({ document }: DocumentDetailTemplateProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingHighlight, setEditingHighlight] = useState<Highlight>();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isVocabFormLoading, setIsVocabFormLoading] = useState(false);

  // Manage highlights state and actions
  const {
    highlights,
    loading: highlightsLoading,
    error: highlightsError,
    loadMore,
    hasMore,
    refetch: refetchHighlights,
  } = useDocumentHighlights(document._id);

  const handleClose = () => {
    setIsLoading(true);
    router.push('/imports');
  };

  const handleHighlightEdit = (highlight: Highlight) => {
    setEditingHighlight(highlight);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingHighlight(undefined);
  };

  const handleVocabSuccess = () => {
    setShowEditModal(false);
    setEditingHighlight(undefined);
    // Refresh highlights data
    refetchHighlights();
  };

  const handleHighlightCreate = (highlight: any) => {
    // This will be called when user creates a new highlight in PDF viewer
    // The highlight creation logic will be handled in PDF viewer
    // but we refresh the highlights list here
    refetchHighlights();
  };

  const handleHighlightDelete = (highlightId: string) => {
    // This will be called when user deletes a highlight
    refetchHighlights();
  };

  // Create vocab object for the form
  const vocabForForm = useMemo((): Vocab | undefined => {
    if (!editingHighlight) return undefined;

    if (editingHighlight.vocab) {
      // If highlight has associated vocab, create complete vocab object
      return {
        _id: editingHighlight.vocab._id,
        user_id: editingHighlight.user_id,
        word: editingHighlight.vocab.word,
        meaning: editingHighlight.vocab.meaning,
        source: document.file_name,
        source_type: SourceType.Document,
        created_at: new Date(),
        tags: editingHighlight.vocab.tags,
        pronunciation_url: editingHighlight.vocab.pronunciation_url,
        examples: editingHighlight.vocab.examples,
      };
    } else {
      // If no vocab, create new vocab from highlight text
      return {
        _id: '',
        user_id: editingHighlight.user_id,
        word: editingHighlight.content.text || '',
        meaning: '',
        source: document.file_name,
        source_type: SourceType.Document,
        created_at: new Date(),
      };
    }
  }, [editingHighlight, document.file_name]);

  const handleToggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Toggle Sidebar Button */}
      <FloatingButton
        variant="primary"
        size="md"
        position="top-right"
        onClick={handleToggleSidebar}
        anchor
      >
        {showSidebar ? '->' : '<-'}
      </FloatingButton>

      {/* Resizable Layout */}
      <PanelGroup direction="horizontal" className="h-full">
        {/* PDF Viewer Panel */}
        <Panel defaultSize={showSidebar ? 70 : 100} minSize={30} className="h-full">
          <PDFViewer
            document={document}
            initialHighlights={highlights}
            onClose={handleClose}
            onHighlightEdit={handleHighlightEdit}
            onHighlightCreate={handleHighlightCreate}
            onHighlightDelete={handleHighlightDelete}
          />
        </Panel>

        {/* Resize Handle */}
        {showSidebar && (
          <>
            <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-col-resize flex items-center justify-center group">
              <div className="w-1 h-8 bg-gray-400 dark:bg-gray-500 rounded-full group-hover:bg-gray-500 dark:group-hover:bg-gray-400 transition-colors"></div>
            </PanelResizeHandle>

            {/* Sidebar Panel */}
            <Panel defaultSize={30} minSize={20} maxSize={50} className="h-full">
              <HighlightsSidebar
                highlights={highlights}
                loading={highlightsLoading}
                loadMore={loadMore}
                onHighlightEdit={handleHighlightEdit}
                onHighlightDelete={handleHighlightDelete}
                hasMore={hasMore}
              />
            </Panel>
          </>
        )}
      </PanelGroup>

      {/* Edit Highlight Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title={editingHighlight?.vocab ? 'Edit Vocabulary' : 'Create Vocabulary from Highlight'}
        size="lg"
      >
        {editingHighlight && (
          <AddEditVocabForm
            edit={!!editingHighlight?.vocab?._id}
            vocab={vocabForForm}
            onSuccess={handleVocabSuccess}
            isLoading={isVocabFormLoading}
          />
        )}
      </Modal>
    </div>
  );
}
