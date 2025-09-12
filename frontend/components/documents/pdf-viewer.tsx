'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
}

// Convert our Highlight type to IHighlight for react-pdf-highlighter
const convertToIHighlight = (highlight: any): IHighlight => ({
  id: highlight._id || highlight.id,
  content: highlight.content,
  position: highlight.position,
  comment: {
    text: highlight.vocab_id
      ? `${highlight.vocab_id.word}: ${highlight.vocab_id.meaning}`
      : highlight.comment?.text || '',
    emoji: highlight.comment?.emoji || '',
  },
});

// Convert IHighlight back to our Highlight type
const convertFromIHighlight = (
  iHighlight: IHighlight,
  documentId: string,
  userId: string
): Highlight => ({
  _id: iHighlight.id,
  user_id: userId,
  vocab_id: '', // Will be set when creating highlight
  document_id: documentId,
  file_hash: '', // Will be set by the server
  content: { text: iHighlight.content?.text || '' },
  position: iHighlight.position,
  comment: iHighlight.comment,
  tags: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
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
      <Button
        size="sm"
        variant="outline"
        onClick={onDelete}
        className="text-red-600 hover:text-red-700"
      >
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
        className="text-sm"
      >
        Add Vocabulary
      </Button>
    </div>
  </div>
);

export function PDFViewer({ document, initialHighlights = [], onClose }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [highlights, setHighlights] = useState<IHighlight[]>([]);
  const [vocabMap, setVocabMap] = useState<Map<string, any>>(new Map());
  const [originalHighlights, setOriginalHighlights] = useState<Highlight[]>([]);

  // Create vocab map from original highlights data
  useEffect(() => {
    const newVocabMap = new Map();
    originalHighlights.forEach((highlight) => {
      if (highlight.vocab_id || highlight.vocab) {
        newVocabMap.set(highlight._id, highlight.vocab || highlight.vocab_id);
      }
    });
    setVocabMap(newVocabMap);
  }, [originalHighlights]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<IHighlight | null>(null);
  const [highlightToEdit, setHighlightToEdit] = useState<string | null>(null);
  const scrollViewerTo = useRef((highlight: IHighlight) => {});
  const { showAlert } = useAlert();
  const { user } = useAuth();

  // Initialize highlights from server data
  useEffect(() => {
    const convertedHighlights = initialHighlights.map(convertToIHighlight);
    setHighlights(convertedHighlights);
    setOriginalHighlights(initialHighlights);
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

  const addHighlight = useCallback((highlight: NewHighlight) => {
    console.log('Saving highlight', highlight);

    // Set the selected highlight for the modal
    setSelectedHighlight({
      ...highlight,
      id: String(Date.now()),
    });
    setIsModalOpen(true);
  }, []);

  const saveHighlight = useCallback(
    (highlight: IHighlight) => {
      setHighlights((prev) => [...prev, highlight]);
      setIsModalOpen(false);
      setSelectedHighlight(null);
      showAlert('success', 'Vocabulary added successfully');
    },
    [showAlert]
  );

  const editHighlight = useCallback(
    (highlightId: string) => {
      const highlight = highlights.find((h) => h.id === highlightId);
      if (highlight) {
        setSelectedHighlight(highlight);
        setHighlightToEdit(highlightId);
        setIsModalOpen(true);
      }
    },
    [highlights]
  );

  const deleteHighlight = useCallback(
    (highlightId: string) => {
      setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
      showAlert('success', 'Highlight deleted successfully');
    },
    [showAlert]
  );

  const handleVocabSuccess = useCallback(
    async (vocab?: Vocab) => {
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
            setHighlights((prev) => [
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
                word: vocab.word,
                meaning: vocab.meaning,
                tags: vocab.tags,
                _id: vocab._id,
              });
              return newMap;
            });

            showAlert('success', 'Highlight created successfully');
          } else {
            showAlert('error', result.message || 'Failed to create highlight');
          }
        } catch (error) {
          console.error('Failed to create highlight:', error);
          showAlert('error', 'Failed to create highlight');
        }
      }
    },
    [selectedHighlight, document, showAlert]
  );

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedHighlight(null);
    setHighlightToEdit(null);
  }, []);

  const handleExportHighlights = () => {
    // TODO: Implement export functionality for highlights
    showAlert('default', 'Export highlights feature coming soon');
  };

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  const scrollToHighlightFromHash = useCallback(() => {
    const highlight = getHighlightById(parseIdFromHash());
    if (highlight) {
      scrollViewerTo.current(highlight);
    }
  }, []);

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
    return (
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading PDF...</h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex justify-center">
          <Loading />
        </div>
      </Card>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {document.file_name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            PDF document for viewing and annotations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportHighlights}>
            Export Highlights ({highlights.length})
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

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
                        setHighlights((prev) =>
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
                highlights={highlights}
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
