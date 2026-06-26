import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
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

    const { assignmentId, content } = await request.json();

    // Verify the assignment exists and belongs to the student's class
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { classSubject: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.classSubject.classId !== student.classId) {
      return NextResponse.json({ error: "This assignment is not for your class" }, { status: 403 });
    }

    // Check if already submitted
    const existing = await prisma.submission.findFirst({
      where: { assignmentId, studentId: student.id },
    });

    if (existing) {
      const updated = await prisma.submission.update({
        where: { id: existing.id },
        data: { textAnswer: content },
      });
      return NextResponse.json(updated);
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: student.id,
        textAnswer: content,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Submit assignment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
