import { User } from './user';

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}

export interface AuthData {
    user: User;
    access_token: string;
    refresh_token: string;
}
