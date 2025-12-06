// ============================================
// Letter Types
// ============================================

export type PaperType = 'classic' | 'vintage' | 'dark' | 'parchment' | 'elegant' | 'midnight' | 'rose' | 'forest';
export type SealDesign = 'classic' | 'heart' | 'star' | 'crown' | 'letter';
export type TemplateType = 'love' | 'future-self' | 'greeting' | 'thank-you' | 'new-year';
export type LetterStatus = 'sealed' | 'delivered' | 'opened';
export type RecurringType = 'yearly' | 'monthly';
export type LetterStyle = 'minimal' | 'elegant' | 'romantic' | 'royal' | 'vintage';

export interface Letter {
  id: string;
  imageUrl: string;
  unlockAt: Date | string;
  scheduledDate?: Date | string | null;
  isRecurring: boolean;
  recurringType?: RecurringType | null;
  createdAt: Date | string;
  openedAt?: Date | string | null;
  status: LetterStatus;
  paperType: PaperType;
  templateType?: TemplateType | null;
  
  // Sender/Recipient
  senderId?: string | null;
  recipientId?: string | null;
  recipientEmail?: string | null;
  recipientName?: string | null;
  senderName?: string | null;
  
  // Content
  message?: string | null;
  audioUrl?: string | null;
  
  // Wax Seal
  sealColor: string;
  sealDesign: SealDesign;
  sealInitials?: string | null;
  
  // Features
  agingEnabled: boolean;
  isAnonymous: boolean;
  letterStyle: LetterStyle;
  isPublic: boolean;
  qrCodeUrl?: string | null;
  
  // Archive flags
  senderArchived?: boolean;
  recipientArchived?: boolean;
}

export interface LetterWithReactions extends Letter {
  reactions?: Reaction[];
}

export interface LetterListItem {
  id: string;
  senderName: string | null;
  recipientName: string | null;
  status: LetterStatus;
  createdAt: string;
  unlockAt: string;
  paperType: PaperType;
  sealColor: string;
  sealDesign: SealDesign;
  sealInitials: string | null;
  templateType: TemplateType | null;
  agingEnabled?: boolean;
}

// ============================================
// Reaction Types
// ============================================

export interface Reaction {
  emoji: string;
  userName?: string | null;
  createdAt?: Date | string;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt?: Date | string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface ApiSuccess<T> {
  data: T;
}

// ============================================
// Form Types
// ============================================

export interface CreateLetterForm {
  file: File | null;
  audioBlob: Blob | null;
  deliveryType: 'duration' | 'scheduled';
  duration: number;
  scheduledDate: Date | null;
  isRecurring: boolean;
  recurringType: RecurringType | null;
  paper: PaperType;
  sealColor: string;
  sealDesign: SealDesign;
  sealInitials: string;
  message: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  selectedTemplate: string | null;
  agingEnabled: boolean;
}

// ============================================
// Component Props Types
// ============================================

export interface WaxSealProps {
  color: string;
  design: SealDesign;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
}

export interface LetterViewProps {
  letter: LetterWithReactions;
}

// ============================================
// Hook Return Types
// ============================================

export interface UseLettersReturn {
  letters: LetterListItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================
// Utility Types
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
