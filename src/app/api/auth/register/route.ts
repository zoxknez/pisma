import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import {
  checkRateLimit,
  rateLimitResponse,
  handleApiError,
  getClientIP,
  successResponse,
} from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    // Rate limiting - strict for auth endpoints
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, 'auth');
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    // Parse and validate body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists", code: "USER_EXISTS" },
        { status: 409 }
      );
    }

    // Hash password with higher cost factor for better security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }, 201);

  } catch (error) {
    return handleApiError(error);
  }
}
