import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import sharp from 'sharp';
import { authOptions } from '@/lib/auth';
import { sendLetterNotification } from '@/lib/email';
import {
  createLetterSchema,
  uploadParamsSchema,
  validateFileUpload,
  sanitizeString,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_AUDIO_TYPES,
  MAX_FILE_SIZE,
  MAX_AUDIO_SIZE,
} from '@/lib/validations';
import {
  checkRateLimit,
  rateLimitResponse,
  handleApiError,
  ApiError,
  getClientIP,
  successResponse,
} from '@/lib/api-utils';

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    // Rate limiting
    const rateLimitKey = user?.id || getClientIP(request);
    const rateLimit = checkRateLimit(rateLimitKey, 'upload');
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const paramsResult = uploadParamsSchema.safeParse({
      filename: searchParams.get('filename'),
      duration: searchParams.get('duration'),
    });

    if (!paramsResult.success) {
      throw new ApiError(400, 'Invalid query parameters', 'VALIDATION_ERROR');
    }

    const { filename, duration: unlockDuration } = paramsResult.data;

    if (!request.body) {
      throw new ApiError(400, 'No body provided', 'NO_BODY');
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const audioFile = formData.get('audio') as File | null;

    if (!file) {
      throw new ApiError(400, 'No file uploaded', 'NO_FILE');
    }

    // Validate image file
    const imageValidation = validateFileUpload(file, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE);
    if (!imageValidation.valid) {
      throw new ApiError(400, imageValidation.error!, 'INVALID_FILE');
    }

    // Validate audio file if present
    if (audioFile) {
      const audioValidation = validateFileUpload(audioFile, ALLOWED_AUDIO_TYPES, MAX_AUDIO_SIZE);
      if (!audioValidation.valid) {
        throw new ApiError(400, audioValidation.error!, 'INVALID_AUDIO');
      }
    }

    // Parse and validate letter data
    const letterData = {
      paperType: formData.get('paperType'),
      message: formData.get('message'),
      sealColor: formData.get('sealColor'),
      sealDesign: formData.get('sealDesign'),
      sealInitials: formData.get('sealInitials'),
      recipientName: formData.get('recipientName'),
      recipientEmail: formData.get('recipientEmail'),
      senderName: formData.get('senderName') || user?.name,
      templateType: formData.get('templateType') || null,
      agingEnabled: formData.get('agingEnabled'),
      isRecurring: formData.get('isRecurring'),
      recurringType: formData.get('recurringType') || null,
      duration: unlockDuration,
      language: formData.get('language'),
      isPublic: formData.get('isPublic'),
      isAnonymous: formData.get('isAnonymous'),
      letterStyle: formData.get('letterStyle'),
    };

    const validationResult = createLetterSchema.safeParse(letterData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // Sanitize user-provided strings
    const sanitizedMessage = validData.message ? sanitizeString(validData.message) : null;
    const sanitizedSenderName = sanitizeString(validData.senderName);
    const sanitizedRecipientName = validData.recipientName 
      ? sanitizeString(validData.recipientName) 
      : null;

    // Process image
    const buffer = Buffer.from(await file.arrayBuffer());
    let processedImageBuffer: Buffer = buffer;

    try {
      const processed = await sharp(buffer)
        .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      processedImageBuffer = processed;
    } catch (error) {
      console.error("Sharp processing failed, using original:", error);
    }

    // Upload image to Vercel Blob
    let blobUrl = "";
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        // Sanitize filename
        const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const blob = await put(
          `letters/${Date.now()}-${safeFilename}.webp`,
          processedImageBuffer,
          { access: 'public' }
        );
        blobUrl = blob.url;
      } else {
        console.warn("Missing BLOB_READ_WRITE_TOKEN, using placeholder.");
        blobUrl = "https://placehold.co/600x800/1a1a1a/ffffff?text=Letter+Saved";
      }
    } catch (error) {
      console.error("Blob upload failed:", error);
      throw new ApiError(500, 'Failed to upload image', 'UPLOAD_FAILED');
    }

    // Upload audio if present
    let audioUrl: string | null = null;
    if (audioFile && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        const audioBlob = await put(
          `audio/${Date.now()}-voice.webm`,
          audioBuffer,
          { access: 'public' }
        );
        audioUrl = audioBlob.url;
      } catch (error) {
        console.error("Audio upload failed:", error);
        // Don't fail the whole request, just skip audio
      }
    }

    // Calculate unlock time
    const unlockAt = new Date(Date.now() + validData.duration * 60 * 60 * 1000);

    // Find recipient user if email provided
    let recipientId: string | null = null;
    if (validData.recipientEmail) {
      const recipient = await prisma.user.findUnique({
        where: { email: validData.recipientEmail },
        select: { id: true },
      });
      recipientId = recipient?.id || null;
    }

    // Create letter in database
    const letter = await prisma.letter.create({
      data: {
        imageUrl: blobUrl,
        unlockAt,
        status: 'sealed',
        paperType: validData.paperType,
        message: sanitizedMessage,
        sealColor: validData.sealColor,
        sealDesign: validData.sealDesign,
        sealInitials: validData.sealInitials || null,
        recipientName: sanitizedRecipientName,
        recipientEmail: validData.recipientEmail || null,
        recipientId,
        senderName: sanitizedSenderName,
        templateType: validData.templateType || null,
        agingEnabled: validData.agingEnabled,
        isRecurring: validData.isRecurring,
        recurringType: validData.recurringType || null,
        audioUrl,
        senderId: user?.id || null,
        isPublic: validData.isPublic,
        isAnonymous: validData.isAnonymous ?? false,
        letterStyle: validData.letterStyle ?? 'minimal',
      },
    });

    // Send email notification (don't await, fire and forget)
    if (validData.recipientEmail) {
      sendLetterNotification({
        recipientEmail: validData.recipientEmail,
        senderName: sanitizedSenderName,
        letterId: letter.id,
        unlockAt,
        language: validData.language as 'en' | 'sr',
      }).catch(err => console.error('Email notification failed:', err));
    }

    return successResponse(letter, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
