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

    if (!student.classId) {
      return NextResponse.json([]);
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        classSubject: {
          classId: student.classId,
        },
      },
      include: {
        classSubject: {
          include: {
            class: true,
            subject: true,
          },
        },
        submissions: {
          where: { studentId: student.id },
        },
      },
      orderBy: { dueDate: "desc" },
    });

    const assignmentsWithSubmission = (assignments as any[]).map((a) => ({
      ...a,
      submission: a.submissions?.[0] || null,
    }));

    return NextResponse.json(assignmentsWithSubmission);
  } catch (error) {
    console.error("Get assignments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
