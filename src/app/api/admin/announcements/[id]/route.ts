export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        author: { select: { fullName: true } },
      },
    });

    if (!announcement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Get announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, content, audienceRole, classId } = await request.json();

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        audienceRole: audienceRole || null,
        classId: classId || null,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Update announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
