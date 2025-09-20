'use client';

import { useState } from 'react';
import { PaginatedResponse, Pagination, Vocab } from '@/types';
import { AddEditVocabForm } from './add-edit-vocab-form';
import { VocabList } from './vocab-list';
import { Modal } from '@/components/templates/modal';
import { Button } from '@/components/templates/button';
import { useRouter } from 'next/navigation';
import { deleteVocabAction } from '@/lib/actions/vocabularies';
import { useAlert, useConfirmModal } from '@/contexts';

interface Props {
  data: Vocab[];
  pagination: Pagination;
}

export function VocabulariesTemplate({ data, pagination }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<Vocab>();
  const { showConfirm } = useConfirmModal();
  const { showAlert } = useAlert();

  const handleAddVocabSuccess = () => {
    setIsModalOpen(false);
    router.refresh();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVocab(undefined);
  };

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to fetch vocabularies for specific page
      console.log('Changing to page:', page);

      // For now, just update local state
      // const response = await fetchVocabularies({ page });
      // setVocabularies(response);
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditVocab = (vocab: Vocab) => {
    setSelectedVocab(vocab);
    handleOpenModal();
  };

  const handleDeleteVocab = async (vocabId: string) => {
    showConfirm(
      {
        title: 'Delete Vocabulary',
        message: 'Are you sure you want to delete this vocabulary? This action cannot be undone.',
        variant: 'danger',
      },
      async () => {
        try {
          await deleteVocabAction(vocabId);
          router.refresh();
        } catch (error) {
          showAlert('error', 'Error deleting vocabulary:', 'Error');
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Vocabularies</h1>
            <p className="text-muted-foreground">
              Manage your vocabulary collection and track your learning progress.
            </p>
          </div>
          <Button onClick={handleOpenModal}>Add New Vocabulary</Button>
        </div>
      </div>

      <VocabList
        data={data}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        onEdit={handleEditVocab}
        onDelete={handleDeleteVocab}
      />

      {/* Add Vocabulary Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Vocabulary" size="lg">
        <AddEditVocabForm
          edit={!!selectedVocab}
          onSuccess={handleAddVocabSuccess}
          vocab={selectedVocab}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}
