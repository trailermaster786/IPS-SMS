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

    const studentRoutes = await prisma.studentRoute.findMany({
      where: { studentId: student.id },
      include: {
        route: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    return NextResponse.json(studentRoutes);
  } catch (error) {
    console.error("Get student transport error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
