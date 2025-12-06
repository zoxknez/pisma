import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get stats
    const [
      totalUsers,
      totalLetters,
      openedLetters,
      publicLetters,
      recentUsers,
      recentLetters,
      usersByDay,
      lettersByDay
    ] = await Promise.all([
      prisma.user.count(),
      prisma.letter.count(),
      prisma.letter.count({ where: { status: "opened" } }),
      prisma.letter.count({ where: { isPublic: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          isAdmin: true,
          _count: {
            select: {
              sentLetters: true,
              receivedLetters: true
            }
          }
        }
      }),
      prisma.letter.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          status: true,
          createdAt: true,
          openedAt: true,
          isPublic: true,
          senderName: true,
          recipientName: true,
          recipientEmail: true,
          sender: {
            select: { name: true, email: true }
          },
          recipient: {
            select: { name: true, email: true }
          }
        }
      }),
      // Users registered per day (last 7 days)
      prisma.$queryRaw`
        SELECT DATE(\"createdAt\") as date, COUNT(*) as count 
        FROM "User" 
        WHERE "createdAt" > NOW() - INTERVAL '7 days'
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
      `,
      // Letters sent per day (last 7 days)
      prisma.$queryRaw`
        SELECT DATE(\"createdAt\") as date, COUNT(*) as count 
        FROM "Letter" 
        WHERE "createdAt" > NOW() - INTERVAL '7 days'
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
      `
    ]);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalLetters,
        openedLetters,
        publicLetters,
        deliveryRate: totalLetters > 0 ? ((openedLetters / totalLetters) * 100).toFixed(1) : 0
      },
      recentUsers,
      recentLetters,
      charts: {
        usersByDay,
        lettersByDay
      }
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
