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
