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
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const classSubjects = await prisma.classSubject.findMany({
      where: { teacherId: teacher.id },
      include: { class: true },
    });

    const classMap = new Map<string, { id: string; name: string }>();
    for (const cs of classSubjects) {
      classMap.set(cs.class.id, { id: cs.class.id, name: cs.class.name });
    }

    return NextResponse.json(Array.from(classMap.values()));
  } catch (error) {
    console.error("Get teacher classes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
