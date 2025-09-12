'use client';

import { useState } from 'react';
import { Modal } from '@/components/templates';
import { DocumentUpload } from './document-upload';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: DocumentUploadModalProps) {
  const handleUploadSuccess = () => {
    onUploadSuccess?.();
    onClose(); // Close modal after successful upload
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Document"
      size="lg"
      className="max-w-2xl"
    >
      <DocumentUpload onUploadSuccess={handleUploadSuccess} />
    </Modal>
  );
}
