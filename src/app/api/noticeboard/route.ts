export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const where: any = {};

    if (role) {
      where.OR = [{ audienceRole: null }, { audienceRole: "ALL" }, { audienceRole: role }];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        author: {
          select: { fullName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Get noticeboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
