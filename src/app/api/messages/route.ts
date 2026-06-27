export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "inbox", "sent", or null for all
    const markRead = searchParams.get("markRead");

    const where: any = {
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
    };

    if (filter === "inbox") {
      where.OR = [{ receiverId: session.user.id }];
    } else if (filter === "sent") {
      where.OR = [{ senderId: session.user.id }];
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: { fullName: true, email: true },
        },
        receiver: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Mark all unread inbox messages as read if requested
    if (markRead === "true") {
      await prisma.message.updateMany({
        where: {
          receiverId: session.user.id,
          isRead: false,
        },
        data: { isRead: true },
      });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, subject, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Receiver and content are required" }, { status: 400 });
    }

    // Check receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content: subject ? `[${subject}] ${content}` : content,
      },
      include: {
        sender: { select: { fullName: true } },
        receiver: { select: { fullName: true } },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
