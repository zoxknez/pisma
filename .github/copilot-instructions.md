# Pisma - Development Guide

## Project Overview

Pisma is a digital letter platform that recreates the nostalgic experience of handwritten correspondence using modern web technology. The app emphasizes intentional waiting, beautiful design, and emotional connection.

## Technology Stack

- **Framework**: Next.js 16.0.7 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion for animations
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: NextAuth.js (Credentials + Google OAuth)
- **Email**: Resend API for notifications
- **Storage**: Vercel Blob for images and audio
- **Image Processing**: Sharp for WebP conversion

## Key Architecture Decisions

### Next.js 16 Async Params
All dynamic route parameters must be awaited:
```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### Prisma Client
- Always run `npx prisma generate` after schema changes
- Use `npx prisma db push` to sync with database
- Note: System environment variables may override .env file

### Email Service
- Email sending is optional - gracefully skips if RESEND_API_KEY is not set
- Uses lazy initialization to prevent build errors

## Database Models

- **User**: Authentication and profile
- **Account/Session**: NextAuth.js requirements
- **Letter**: Core content with wax seals, audio, scheduling
- **Reaction**: Emoji reactions on letters
- **LetterTemplate**: Pre-designed letter templates

## Component Guidelines

- Use Framer Motion for all animations
- Follow glassmorphism design with dark theme
- Maintain Georgia serif font for letter content
- Use Lucide icons consistently

## API Routes

- `POST /api/letters` - Create new letter
- `GET /api/letters` - Get user's letters
- `POST /api/letters/[id]/open` - Mark letter as opened
- `POST /api/letters/[id]/reactions` - Add reaction
- `POST /api/upload` - Upload images with Sharp processing
- `POST /api/auth/register` - User registration

## Environment Variables Required

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npx prisma studio # Open Prisma database viewer
```

## Important Notes

- System environment variables may override .env file - check with `[System.Environment]::GetEnvironmentVariable("DATABASE_URL")` on Windows
- When using Prisma commands, you may need to set the DATABASE_URL in the current terminal session
- All new features (wax seals, audio, templates, aging, reactions) are implemented and ready for use
