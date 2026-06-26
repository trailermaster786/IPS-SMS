import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    // Verify the class is taught by this teacher
    const classSubject = await prisma.classSubject.findFirst({
      where: {
        classId: id,
        teacherId: teacher.id,
      },
    });

    if (!classSubject) {
      return NextResponse.json({ error: "Class not found or not assigned" }, { status: 404 });
    }

    const students = await prisma.student.findMany({
      where: { classId: id },
      include: {
        user: {
          select: { fullName: true },
        },
      },
      orderBy: {
        user: { fullName: "asc" },
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Get students error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
