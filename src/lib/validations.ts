import { z } from 'zod';

// ============================================
// Auth Validations
// ============================================

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email too long')
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string()
    .min(4, 'Password must be at least 4 characters')
    .max(100, 'Password too long'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .transform(val => val.trim()),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email').transform(val => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// Letter Validations
// ============================================

export const letterQuerySchema = z.object({
  type: z.enum(['received', 'sent']).default('received'),
});

export const createLetterSchema = z.object({
  paperType: z.enum(['classic', 'vintage', 'dark', 'parchment', 'elegant', 'midnight', 'rose', 'forest']).default('classic'),
  message: z.string().max(10000, 'Message too long').optional(),
  sealColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .default('#8B0000'),
  sealDesign: z.enum(['classic', 'heart', 'star', 'crown', 'letter']).default('classic'),
  sealInitials: z.string().max(3, 'Initials too long').optional(),
  recipientName: z.string().max(100, 'Name too long').optional(),
  recipientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  senderName: z.string().max(100, 'Name too long').default('Anonymous'),
  templateType: z.enum(['love', 'future-self', 'greeting', 'thank-you', 'new-year']).optional().nullable(),
  agingEnabled: z.coerce.boolean().default(true),
  isRecurring: z.coerce.boolean().default(false),
  recurringType: z.enum(['yearly', 'monthly']).optional().nullable(),
  duration: z.coerce.number().min(1).max(87600).default(48), // max 10 years
  language: z.enum(['en', 'sr']).default('en'),
  isPublic: z.coerce.boolean().default(false),
  isAnonymous: z.coerce.boolean().default(false),
  letterStyle: z.enum(['minimal', 'elegant', 'romantic', 'royal', 'vintage']).default('minimal'),
});

export const reactionSchema = z.object({
  emoji: z
    .string()
    .min(1, 'Emoji is required')
    .max(10, 'Invalid emoji')
    .regex(/^[\p{Emoji}]+$/u, 'Must be a valid emoji'),
});

// ============================================
// File Upload Validations
// ============================================

export const uploadParamsSchema = z.object({
  filename: z.string().max(255).default('letter.png'),
  duration: z.coerce.number().min(0).max(87600).default(0),
});

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_AUDIO_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFileUpload(file: File, allowedTypes: string[], maxSize: number) {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` };
  }
  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` };
  }
  return { valid: true, error: null };
}

// ============================================
// Sanitization Helpers
// ============================================

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<embed/gi,
  /<object/gi,
];

export function sanitizeString(input: string): string {
  let sanitized = input;
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  // Escape HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  return sanitized;
}

// ============================================
// Types
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LetterQueryInput = z.infer<typeof letterQuerySchema>;
export type CreateLetterInput = z.infer<typeof createLetterSchema>;
export type ReactionInput = z.infer<typeof reactionSchema>;
