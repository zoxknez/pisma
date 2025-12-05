import { NextResponse } from 'next/server';

// ============================================
// Rate Limiting (In-Memory - za produkciju koristiti Redis)
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  default: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 req/min
  auth: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 req/min za login/register
  upload: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 uploads/min
  sensitive: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 req/min za sensitive ops
};

export function checkRateLimit(
  identifier: string,
  configType: keyof typeof RATE_LIMIT_CONFIGS = 'default'
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = RATE_LIMIT_CONFIGS[configType];
  const now = Date.now();
  const key = `${configType}:${identifier}`;

  // Očisti stare unose periodično
  if (Math.random() < 0.01) {
    cleanupRateLimitStore();
  }

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// ============================================
// Error Handling
// ============================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Ne izlažemo interne greške korisniku
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { error: error.message, stack: error.stack },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

// ============================================
// Response Helpers
// ============================================

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status: number, code?: string) {
  return NextResponse.json({ error: message, code }, { status });
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return NextResponse.json(
    {
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(resetAt),
      },
    }
  );
}

// ============================================
// Request Helpers
// ============================================

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, 'Invalid JSON body', 'INVALID_JSON');
  }
}

// ============================================
// Auth Helpers
// ============================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
}

export function requireAuth(user: AuthenticatedUser | null | undefined): asserts user is AuthenticatedUser {
  if (!user || !user.id) {
    throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
  }
}
