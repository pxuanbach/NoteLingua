// Document Types
export interface Document {
  _id: string;
  user_id: string;
  file_hash: string;
  file_name: string;
  created_at: string;
}

export interface ImportDocumentRequest {
  file: File;
}
