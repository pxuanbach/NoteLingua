'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Card, Loading, Modal } from '@/components/templates';
import { useAlert, useAuth } from '@/contexts';
import { Document } from '@/types';
import type { Highlight } from '@/types';
import type { Vocab } from '@/types/vocab';
import { AddEditVocabForm } from '@/components/vocabularies/add-edit-vocab-form';
import { SourceType } from '@/types/vocab';
import { createHighlightAction } from '@/lib/actions/highlights';
import {
  PdfLoader,
  PdfHighlighter,
  Tip,
  Highlight as PDFHighlight,
  Popup,
  AreaHighlight,
} from 'react-pdf-highlighter';

import type { IHighlight, NewHighlight } from 'react-pdf-highlighter';
import type { IHighlightWithVocab } from '@/types';
import 'react-pdf-highlighter/dist/style.css';

interface PDFViewerProps {
  document: Document;
  initialHighlights?: Highlight[];
  onClose: () => void;
  onHighlightEdit: (highlight: Highlight) => void;
  onHighlightCreate: (highlight: any) => void;
  onHighlightDelete: (highlightId: string) => void;
}

// Convert our Highlight type to IHighlight for react-pdf-highlighter
const convertToIHighlight = (highlight: Highlight): IHighlight => ({
  id: highlight._id,
  content: highlight.content,
  position: highlight.position,
  comment: {
    text: highlight.vocab
      ? `${highlight.vocab.word}: ${highlight.vocab.meaning}`
      : highlight.comment?.text || '',
    emoji: highlight.comment?.emoji || '',
  },
});

const parseIdFromHash = () => document.location.hash.slice('#highlight-'.length);

const resetHash = () => {
  document.location.hash = '';
};

const HighlightPopup = ({
  vocab,
  onEdit,
  onDelete,
}: {
  vocab?: {
    word: string;
    meaning: string;
    tags?: string[];
  };
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[250px]">
    {vocab && (
      <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
        <div className="font-semibold text-gray-900 dark:text-gray-100">{vocab.word}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vocab.meaning}</div>
        {vocab.tags && vocab.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {vocab.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    )}
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={onEdit}>
        Edit
      </Button>
      <Button size="sm" variant="outline" onClick={onDelete}>
        Delete
      </Button>
    </div>
  </div>
);

const CustomTip = ({ onOpen, onConfirm }: { onOpen: () => void; onConfirm: () => void }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[120px]">
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => {
          onOpen();
          onConfirm();
        }}
      >
        Add Vocabulary
      </Button>
    </div>
  </div>
);

export function PDFViewer({
  document,
  initialHighlights = [],
  onClose,
  onHighlightEdit,
  onHighlightCreate,
  onHighlightDelete,
}: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [pdfHighlights, setPdfHighlights] = useState<IHighlight[]>([]);
  const [vocabMap, setVocabMap] = useState<Map<string, any>>(new Map());
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // Create vocab map from original highlights data
  useEffect(() => {
    const newVocabMap = new Map();
    highlights.forEach((highlight) => {
      if (highlight.vocab_id || highlight.vocab) {
        newVocabMap.set(highlight._id, highlight.vocab || highlight.vocab_id);
      }
    });
    setVocabMap(newVocabMap);
  }, [highlights]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<IHighlight | null>(null);
  const [highlightToEdit, setHighlightToEdit] = useState<string | null>(null);
  const scrollViewerTo = useRef((highlight: IHighlight) => {});
  const { showAlert } = useAlert();
  const { user } = useAuth();

  // Initialize highlights from server data
  useEffect(() => {
    const convertedHighlights = initialHighlights.map(convertToIHighlight);
    setPdfHighlights(convertedHighlights);
    setHighlights(initialHighlights);
  }, [initialHighlights]);

  useEffect(() => {
    // Check if it's a PDF file
    if (!document.file_name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported for viewing');
      setLoading(false);
      return;
    }

    // Construct PDF URL from backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const pdfPath = `${baseUrl}/uploads/${document.file_name}`;

    setPdfUrl(pdfPath);
    setLoading(false);
  }, [document]);

  const addHighlight = (highlight: NewHighlight) => {
    console.log('Saving highlight', highlight);

    // Set the selected highlight for the modal
    setSelectedHighlight({
      ...highlight,
      id: String(Date.now()),
    });
    setIsModalOpen(true);
  };

  const editHighlight = (highlightId: string) => {
    console.log('Editing highlight', highlightId);

    const originalHighlight = highlights.find((h) => h._id === highlightId);
    if (originalHighlight) {
      onHighlightEdit(originalHighlight);
    }
  };

  const deleteHighlight = (highlightId: string) => {
    onHighlightDelete(highlightId);
    // Remove from local state immediately for UI responsiveness
    setPdfHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    showAlert('success', 'Highlight deleted successfully');
  };

  const handleVocabSuccess = async (vocab?: Vocab) => {
    setIsModalOpen(false);
    setSelectedHighlight(null);
    setHighlightToEdit(null);

    if (selectedHighlight && vocab) {
      try {
        // Create highlight with vocab_id after vocabulary is saved
        const highlightData = {
          vocab_id: vocab._id,
          document_id: document._id,
          file_hash: document.file_hash,
          content: {
            text: selectedHighlight.content?.text || '',
          },
          position: selectedHighlight.position,
          comment: selectedHighlight.comment,
        };

        const result = await createHighlightAction(highlightData);

        if (result.success && result.data) {
          const newHighlightId = result.data._id;

          // Add to local highlights state
          setPdfHighlights((prev) => [
            ...prev,
            {
              ...selectedHighlight,
              id: newHighlightId,
            },
          ]);

          // Update vocab map with the new vocab data
          setVocabMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(newHighlightId, {
              _id: vocab._id,
              word: vocab.word,
              meaning: vocab.meaning,
              tags: vocab.tags,
            });
            return newMap;
          });

          onHighlightCreate(result.data);

          showAlert('success', 'Highlight and vocabulary saved successfully');
        } else {
          showAlert('error', result.message || 'Failed to save highlight');
        }
      } catch (error) {
        console.error('Failed to create highlight:', error);
        showAlert('error', 'Failed to create highlight');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedHighlight(null);
    setHighlightToEdit(null);
  };

  const handleExportHighlights = () => {
    // TODO: Implement export functionality for highlights
    showAlert('default', 'Export highlights feature coming soon');
  };

  const getHighlightById = (id: string) => {
    return pdfHighlights.find((highlight) => highlight.id === id);
  };

  const scrollToHighlightFromHash = () => {
    const highlight = getHighlightById(parseIdFromHash());
    if (highlight) {
      scrollViewerTo.current(highlight);
    }
  };

  if (error) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">PDF Viewer</h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={onClose}>Go Back</Button>
        </div>
      </Card>
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 h-screen flex flex-col">
      {/* PDF Viewer with Highlighter */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <PdfLoader url={pdfUrl} beforeLoad={<Loading />}>
            {(pdfDocument) => (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={resetHash}
                scrollRef={(scrollTo) => {
                  scrollViewerTo.current = scrollTo;
                  scrollToHighlightFromHash();
                }}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection
                ) => {
                  return (
                    <CustomTip
                      onOpen={transformSelection}
                      onConfirm={() => {
                        addHighlight({ content, position, comment: { text: '', emoji: '' } });
                        hideTipAndSelection();
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
                  isScrolledTo
                ) => {
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
                      onChange={(boundingRect) => {
                        // Handle area highlight changes
                        setPdfHighlights((prev) =>
                          prev.map((h) =>
                            h.id === highlight.id
                              ? {
                                  ...h,
                                  position: {
                                    ...h.position,
                                    boundingRect: viewportToScaled(boundingRect),
                                  },
                                  content: {
                                    ...h.content,
                                    image: screenshot(boundingRect),
                                  },
                                }
                              : h
                          )
                        );
                      }}
                    />
                  );

                  return (
                    <Popup
                      popupContent={
                        <HighlightPopup
                          vocab={
                            vocabMap.get(highlight.id)
                              ? {
                                  word: vocabMap.get(highlight.id).word,
                                  meaning: vocabMap.get(highlight.id).meaning,
                                  tags: vocabMap.get(highlight.id).tags,
                                }
                              : undefined
                          }
                          onEdit={() => editHighlight(highlight.id)}
                          onDelete={() => deleteHighlight(highlight.id)}
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
                highlights={pdfHighlights}
              />
            )}
          </PdfLoader>
        </div>
      </div>

      {/* Modal for adding/editing vocabulary */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={highlightToEdit ? 'Edit Vocabulary' : 'Add New Vocabulary'}
        size="lg"
      >
        {selectedHighlight && (
          <AddEditVocabForm
            edit={!!highlightToEdit}
            vocab={
              highlightToEdit
                ? {
                    _id: highlightToEdit,
                    user_id: user?.id || '',
                    word: selectedHighlight.content?.text || '',
                    meaning: '',
                    tags: [],
                    source: document._id,
                    source_type: SourceType.Document,
                    examples: [],
                    created_at: new Date(),
                  }
                : {
                    _id: '',
                    user_id: user?.id || '',
                    word: selectedHighlight.content?.text || '',
                    meaning: '',
                    tags: [],
                    source: document._id,
                    source_type: SourceType.Document,
                    examples: [],
                    created_at: new Date(),
                  }
            }
            onSuccess={handleVocabSuccess}
          />
        )}
      </Modal>
    </div>
  );
}
