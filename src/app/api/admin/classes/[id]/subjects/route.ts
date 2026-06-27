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

    const classSubjects = await prisma.classSubject.findMany({
      where: { classId: id },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
    });

    return NextResponse.json(classSubjects);
  } catch (error) {
    console.error("Get class subjects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
