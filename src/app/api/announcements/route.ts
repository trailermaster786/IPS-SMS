export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const announcements = await prisma.announcement.findMany({
      include: {
        author: {
          select: { fullName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Get announcements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, audienceRole, classId } = await request.json();

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        audienceRole,
        classId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Create announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
