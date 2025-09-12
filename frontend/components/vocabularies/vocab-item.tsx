'use client';

import { useState } from 'react';
import { Vocab } from '@/types/vocab';
import { Card } from '@/components/templates/card';
import { Button } from '@/components/templates/button';

interface Props {
  vocab: Vocab;
  onEdit?: (vocab: Vocab) => void;
  onDelete?: (vocabId: string) => void;
  onReview?: (vocabId: string, correct: boolean) => void;
}

export function VocabItem({ vocab, onEdit, onDelete, onReview }: Props) {
  const [isReviewExpanded, setIsReviewExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const playPronunciation = async () => {
    if (!vocab.pronunciation_url || isPlaying) return;

    setIsPlaying(true);
    setAudioError(false);

    try {
      const audio = new Audio(vocab.pronunciation_url);

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setAudioError(true);
        setIsPlaying(false);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing pronunciation:', error);
      setAudioError(true);
      setIsPlaying(false);
    }
  };
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSourceTypeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'document':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'package':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'self':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 gap-4 h-full">
        {/* Header Section - Word, Meaning, Source Type, Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2 flex-shrink-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {vocab.word}
                </h3>
                {vocab.pronunciation_url && (
                  <button
                    onClick={playPronunciation}
                    disabled={isPlaying}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={audioError ? 'Audio unavailable' : 'Play pronunciation'}
                  >
                    {isPlaying ? (
                      <span className="text-sm">🔊</span>
                    ) : audioError ? (
                      <span className="text-sm text-red-500">❌</span>
                    ) : (
                      <span className="text-sm text-blue-500">🔊</span>
                    )}
                  </button>
                )}
              </div>
              <span className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
                {vocab.meaning}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-500 dark:text-gray-400">Source Type:</span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getSourceTypeColor(
                    vocab.source_type
                  )}`}
                >
                  {vocab.source_type}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vocab)}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ✏️
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(vocab._id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 dark:border-red-400"
              >
                🗑️
              </Button>
            )}
          </div>
        </div>

        {/* Content Grid - 2 Columns: Metadata+Tags | Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Metadata + Tags */}
          <div className="space-y-4">
            {/* Metadata Section */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4 mb-2">
                {vocab.source && (
                  <div className="flex items-center gap-1">
                    <span>📄</span>
                    <span className="truncate">{vocab.source}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{formatDate(vocab.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            {vocab.tags && vocab.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-1">
                  {vocab.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Examples */}
          {vocab.examples && vocab.examples.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Examples:
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {vocab.examples.map((example, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                  >
                    "{example}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expandable Review History - Bottom of Card */}
        {vocab.review_history && vocab.review_history.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <button
              onClick={() => setIsReviewExpanded(!isReviewExpanded)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>📚 Review History ({vocab.review_history.length})</span>
              <span
                className={`transform transition-transform ${isReviewExpanded ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </button>

            {isReviewExpanded && (
              <div className="mt-3 space-y-2">
                {vocab.review_history.map((review, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                    <span
                      className={`font-medium ${
                        review.correct
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {review.correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Review Actions - Always at bottom */}
        {onReview && (
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-600 mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(vocab._id, true)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 dark:border-green-400 flex-1"
            >
              ✓ Correct
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(vocab._id, false)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 dark:border-red-400 flex-1"
            >
              ✗ Incorrect
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
