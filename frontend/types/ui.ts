// Form and UI Types
export interface FormState {
  isLoading: boolean;
  error?: string;
  success?: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  requiresAuth?: boolean;
}
