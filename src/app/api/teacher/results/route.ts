export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
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

    const { results } = await request.json();

    // Verify teacher owns the classSubject for each result
    for (const result of results) {
      const classSubject = await prisma.classSubject.findUnique({
        where: { id: result.classSubjectId },
      });
      if (!classSubject || classSubject.teacherId !== teacher.id) {
        return NextResponse.json(
          { error: `Not authorized for class subject ${result.classSubjectId}` },
          { status: 403 }
        );
      }
    }

    // Use transaction for atomicity
    await prisma.$transaction(
      results.map((result: { studentId: string; classSubjectId: string; term: string; examType: string; marksObtained: number; totalMarks: number }) => {
        const grade = calculateGrade(result.marksObtained, result.totalMarks);
        return prisma.result.create({
          data: {
            studentId: result.studentId,
            classSubjectId: result.classSubjectId,
            term: result.term,
            examType: result.examType,
            marksObtained: result.marksObtained,
            totalMarks: result.totalMarks,
            grade,
          },
        });
      })
    );

    return NextResponse.json({ message: "Results submitted successfully" });
  } catch (error) {
    console.error("Submit results error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calculateGrade(marks: number, total: number): string {
  const percentage = (marks / total) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C+";
  if (percentage >= 40) return "C";
  if (percentage >= 30) return "D";
  return "F";
}
