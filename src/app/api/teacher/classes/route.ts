export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const classSubjects = await prisma.classSubject.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: true,
        subject: true,
        _count: {
          select: { results: true },
        },
      },
    });

    return NextResponse.json(classSubjects);
  } catch (error) {
    console.error("Get teacher classes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
