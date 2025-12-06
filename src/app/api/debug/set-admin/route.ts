import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER USE
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true
      }
    });
    return NextResponse.json({ users });
  }
  
  // Set user as admin
  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true }
  });
  
  return NextResponse.json({ 
    success: true, 
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin
    }
  });
}
