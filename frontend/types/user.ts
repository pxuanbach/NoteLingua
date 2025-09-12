// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  created_at: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UserStats {
  totalVocabulary: number;
  totalDocuments: number;
  totalNotes: number;
  joinedDate: string;
}
