# PISMA | Ultra Modern

The art of waiting in the age of instant. A digital letter platform that brings back the magic of handwritten correspondence with modern technology.

## Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Neon (PostgreSQL) + Prisma ORM
- **Authentication**: NextAuth.js (Credentials + Google OAuth)
- **Storage**: Vercel Blob
- **Image Processing**: Sharp
- **Email**: Resend API
- **UI Components**: Custom Shadcn-like components with glassmorphism

## Features

### Core Experience
- **The Desk**: A cinematic interface for digitizing handwriting with paper textures
- **Time-Locking**: Server-side validation of unlock times - letters arrive when they're meant to
- **3D Unboxing**: CSS 3D transforms for the envelope opening experience
- **Real-time Tracking**: Animated radar interface for locked letters

### New Features
- **Custom Wax Seals**: Choose colors, designs, and add your initials
- **Audio Messages**: Record voice messages to accompany your letters
- **Letter Templates**: Pre-designed templates (Love Letters, Letters to Future Self, Greetings, Thank You)
- **Paper Aging Effects**: Simulated aging with yellowing, stains, and fold lines
- **Reactions**: React to letters with emojis
- **QR Code Integration**: Generate QR codes to link physical letters to digital versions
- **Scheduled Delivery**: Set specific dates or use duration-based delivery
- **Recurring Letters**: Schedule monthly, yearly, or custom recurring deliveries
- **Email Notifications**: Get notified when letters are sent and delivered

### User Experience
- **Authentication**: Secure login with email/password or Google
- **Inbox/Outbox**: View all sent and received letters
- **Sender/Recipient Info**: Track who sent and receives each letter

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with:

```env
# Database (Required)
DATABASE_URL="postgresql://..."

# NextAuth (Required)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Vercel Blob Storage (Optional for demo)
BLOB_READ_WRITE_TOKEN="your-blob-token"

# Resend Email (Optional - notifications disabled without this)
RESEND_API_KEY="re_..."

# App URL for emails
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth routes
│   │   ├── letters/        # Letter CRUD and reactions
│   │   └── upload/         # Image upload with Sharp
│   ├── auth/               # Login/Register pages
│   ├── inbox/              # User's letter dashboard
│   ├── letter/[id]/        # Letter view with aging effects
│   ├── track/              # Letter tracking radar
│   └── write/              # Letter composition
├── components/
│   ├── AgingEffect.tsx     # Paper aging simulation
│   ├── AudioRecorder.tsx   # Voice message recording
│   ├── QRCodeGenerator.tsx # QR code for physical letters
│   ├── ReactionPicker.tsx  # Emoji reactions
│   ├── ScheduledDelivery.tsx # Delivery scheduling
│   ├── TemplateSelector.tsx # Letter templates
│   └── WaxSeal.tsx         # Custom wax seals
└── lib/
    ├── auth.ts             # NextAuth configuration
    ├── email.ts            # Resend email service
    ├── prisma.ts           # Prisma client
    └── utils.ts            # Utility functions
```
