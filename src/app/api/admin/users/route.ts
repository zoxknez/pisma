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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
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
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, action } = await request.json();

    if (action === "makeAdmin") {
      await prisma.user.update({
        where: { id: userId },
        data: { isAdmin: true }
      });
    } else if (action === "removeAdmin") {
      // Can't remove own admin status
      if (userId === session.user.id) {
        return NextResponse.json({ error: "Cannot remove your own admin status" }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: userId },
        data: { isAdmin: false }
      });
    } else if (action === "delete") {
      // Can't delete self
      if (userId === session.user.id) {
        return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
      }
      await prisma.user.delete({
        where: { id: userId }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin users patch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
