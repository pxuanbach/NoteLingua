'use client';

import { useState } from 'react';
import { Button } from '@/components/templates/button';
import { Input } from '@/components/templates/input';
import { Textarea } from '@/components/templates/textarea';
import { SourceType, Vocab } from '@/types/vocab';
import { createVocabAction, updateVocabAction } from '@/lib/actions/vocabularies';
import { useAlert } from '@/contexts';

interface Props {
  onSuccess?: (vocab?: Vocab) => void;
  isLoading?: boolean;
  edit?: boolean;
  vocab?: Vocab;
}

export function AddEditVocabForm({ edit, vocab, onSuccess, isLoading = false }: Props) {
  const [formData, setFormData] = useState({
    word: vocab?.word || '',
    meaning: vocab?.meaning || '',
    tags: vocab?.tags ? vocab.tags.join(', ') : '',
    source: vocab?.source || undefined,
    source_type: vocab?.source_type || SourceType.Self,
    examples: vocab?.examples ? vocab.examples.join('\n') : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.word.trim()) {
      newErrors.word = 'Word is required';
    }
    if (!formData.meaning.trim()) {
      newErrors.meaning = 'Meaning is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setSubmitLoading(true);
    const submitData = {
      ...formData,
      tags: formData.tags
        ? formData.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
      examples: formData.examples
        ? formData.examples
            .split('\n')
            .map((ex) => ex.trim())
            .filter((ex) => ex)
        : [],
    };
    try {
      let result;
      if (edit && vocab?._id) {
        result = await updateVocabAction(vocab._id, submitData);
      } else {
        result = await createVocabAction(submitData);
      }
      if (result.error) {
        setErrors({ submit: result.error });
      } else {
        // Reset form on success (only for add)
        if (!edit) {
          setFormData({
            word: '',
            meaning: '',
            tags: '',
            source: undefined,
            source_type: SourceType.Self,
            examples: '',
          });
        }
        // Clear any previous errors
        setErrors({});
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result.data);
        }
        // Show success message
        showAlert(
          'success',
          edit ? 'Vocabulary updated successfully!' : 'Vocabulary added successfully!',
          'Success'
        );
      }
    } catch (error) {
      setErrors({
        submit: edit
          ? 'Failed to update vocabulary. Please try again.'
          : 'Failed to add vocabulary. Please try again.',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-2">
      <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Word <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.word}
              onChange={(e) => handleInputChange('word', e.target.value)}
              placeholder="Enter the word"
              required
            />
            {errors.word && <p className="text-red-500 text-sm mt-1">{errors.word}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Meaning <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.meaning}
              onChange={(e) => handleInputChange('meaning', e.target.value)}
              placeholder="Enter the meaning of the word"
              required
            />
            {errors.source && <p className="text-red-500 text-sm mt-1">{errors.source}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
            <Input
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="noun, verb, adjective..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Examples (one per line)</label>
          <Textarea
            value={formData.examples}
            onChange={(e) => handleInputChange('examples', e.target.value)}
            placeholder="Example sentences using this word..."
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          {errors.submit && <p className="text-red-500 text-sm mr-4">{errors.submit}</p>}
          <Button type="submit" disabled={submitLoading || isLoading} className="px-6 py-2">
            {submitLoading
              ? edit
                ? 'Updating...'
                : 'Adding...'
              : edit
              ? 'Update Vocabulary'
              : 'Add Vocabulary'}
          </Button>
        </div>
      </form>
    </div>
  );
}
