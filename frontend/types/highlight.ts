// Highlight Types - Compatible with react-pdf-highlighter
export interface Highlight {
  _id: string;
  user_id: string;
  vocab_id: string;
  vocab?: {
    _id: string;
    word: string;
    meaning: string;
    pronunciation_url?: string;
    tags?: string[];
    examples?: string[];
  };
  document_id: string;
  file_hash: string;
  content: {
    text: string;
  };
  position: HighlightPosition;
  comment?: HighlightComment;
  tags?: string[];
  source_tag?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHighlightRequest {
  vocab_id: string;
  document_id: string;
  file_hash: string;
  content: {
    text: string;
  };
  position: HighlightPosition;
  comment?: HighlightComment;
  tags?: string[];
  source_tag?: string;
}

export interface UpdateHighlightRequest {
  content?: {
    text?: string;
  };
  comment?: HighlightComment;
  tags?: string[];
  source_tag?: string;
}

export interface HighlightFilters {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
}

export interface HighlightSearchRequest extends HighlightFilters {
  q: string;
}

// React PDF Highlighter compatible types
export interface HighlightPosition {
  boundingRect: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
  rects: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  }>;
  pageNumber: number; // Required for react-pdf-highlighter
}

export interface HighlightContent {
  text: string;
}

export interface HighlightComment {
  text?: string;
  emoji?: string;
}

export interface ReactPdfHighlight {
  content: HighlightContent;
  position: HighlightPosition;
  comment?: HighlightComment;
  id: string; // Required for react-pdf-highlighter
}

// Extended IHighlight with vocab data
export interface IHighlightWithVocab extends ReactPdfHighlight {
  vocab?: {
    _id: string;
    word: string;
    meaning: string;
    pronunciation_url?: string;
    tags?: string[];
    examples?: string[];
  };
}
