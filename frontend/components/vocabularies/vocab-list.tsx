'use client';

import React, { useState } from 'react';
import { Vocab, SourceType, Pagination } from '@/types';
import { VocabItem } from './vocab-item';
import { PaginatedList } from '@/components/templates/paginated-list';
import { Button } from '@/components/templates/button';
import { Input } from '@/components/templates/input';
import { Select } from '@/components/templates/select';

interface VocabListProps {
  data: Vocab[];
  pagination: Pagination;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onEdit?: (vocab: Vocab) => void;
  onDelete?: (vocabId: string) => void;
}

export function VocabList({
  data,
  pagination,
  isLoading = false,
  onPageChange,
  onEdit,
  onDelete,
}: VocabListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType | ''>('');

  const sourceTypeOptions = [
    { value: '', label: 'All Sources' },
    { value: SourceType.Document, label: 'Document' },
    { value: SourceType.Package, label: 'Package' },
    { value: SourceType.Self, label: 'Self' },
  ];

  // Handle search/filter change (call parent to reload data)
  const handleSearch = () => {
    // You can call a prop like onSearch if needed
    // For now, just log
    // onSearch?.(searchTerm, selectedSourceType);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSourceType('');
    // onSearch?.('', '');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search vocabularies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="sm:w-48">
            <Select
              value={selectedSourceType}
              onChange={(e) => setSelectedSourceType(e.target.value as SourceType | '')}
              options={sourceTypeOptions}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} variant="default">
              Search
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Vocabulary List & Pagination */}
      <PaginatedList
        data={data}
        pagination={pagination}
        loading={isLoading}
        ItemComponent={({ item: vocab, index }) => (
          <VocabItem
            key={vocab._id}
            vocab={vocab}
            onEdit={onEdit}
            onDelete={onDelete}
            // onReview={onReview}
          />
        )}
        emptyTitle="No vocabularies found"
        emptyDescription="You haven't added any vocabularies yet. Start by adding your first vocabulary!"
        loadingMessage="Loading vocabularies..."
        className="space-y-4"
        itemClassName="cursor-pointer"
        // onItemClick={(item) => onSelect?.(item)}
        showPagination={true}
        onPageChange={onPageChange}
      />
    </div>
  );
}
