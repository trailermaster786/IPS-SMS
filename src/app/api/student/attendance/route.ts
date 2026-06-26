export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const attendance = await prisma.attendance.findMany({
      where: { studentId: student.id },
      include: { class: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
