import { PaginationQuery } from './api';

export enum SourceType {
  Document = 'document',
  Package = 'package',
  Self = 'self',
}

export interface Vocab {
  _id: string;
  user_id: string;
  word: string;
  meaning: string;
  pronunciation_url?: string;
  tags?: string[];
  source?: string;
  source_type: SourceType;
  examples?: string[];
  review_history?: ReviewHistory[];
  created_at: Date;
  document?: {
    _id: string;
    file_name: string;
    file_hash: string;
    created_at: string;
  };
}

export interface CreateVocabRequest {
  word: string;
  meaning: string;
  pronunciation_url?: string;
  tags?: string[];
  source?: string;
  source_type: SourceType;
  examples?: string[];
}

export interface UpdateVocabRequest {
  word?: string;
  meaning?: string;
  pronunciation_url?: string;
  tags?: string[];
  examples?: string[];
}

export interface ReviewHistory {
  date: Date;
  correct: boolean;
}

export interface VocabReviewRequest {
  correct: boolean;
}

export interface VocabQueryParams extends PaginationQuery {
  tags?: string[];
  source_type?: SourceType;
}
