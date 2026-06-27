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

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const dayOfWeek = now.getDay();

    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: student.id },
      select: { status: true, date: true },
      orderBy: { date: "desc" },
    });

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (a: { status: string }) => a.status === "PRESENT"
    ).length;
    const attendancePercentage =
      totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0;

    const classId = student.classId;

    const assignments = classId
      ? await prisma.assignment.findMany({
          where: {
            classSubject: { classId },
            dueDate: { gte: now },
          },
          select: { id: true, title: true, dueDate: true },
          orderBy: { dueDate: "asc" },
        })
      : [];

    const results = await prisma.result.findMany({
      where: { studentId: student.id },
      select: {
        id: true,
        marksObtained: true,
        totalMarks: true,
        grade: true,
        examType: true,
        createdAt: true,
        classSubject: {
          include: { subject: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const timetableSlots = classId
      ? await prisma.timetableSlot.findMany({
          where: {
            classId,
            dayOfWeek,
          },
          include: {
            classSubject: {
              include: { subject: { select: { name: true } } },
            },
          },
          orderBy: { startTime: "asc" },
        })
      : [];

    const recentGrades = results.slice(0, 5).map((r) => ({
      id: r.id,
      subject: r.classSubject.subject.name,
      grade: r.grade,
      marks: r.marksObtained,
      totalMarks: r.totalMarks,
      examType: r.examType,
      date: r.createdAt,
    }));

    const gradePoints: Record<string, number> = {
      "A+": 4.0,
      A: 4.0,
      "B+": 3.5,
      B: 3.0,
      "C+": 2.5,
      C: 2.0,
      D: 1.0,
      F: 0,
    };

    let totalPoints = 0;
    let gradedCount = 0;
    for (const r of results) {
      if (r.grade && gradePoints[r.grade] !== undefined) {
        totalPoints += gradePoints[r.grade];
        gradedCount++;
      }
    }
    const averageGradeValue = gradedCount > 0 ? totalPoints / gradedCount : 0;

    let averageGrade = "N/A";
    if (averageGradeValue >= 3.8) averageGrade = "A+";
    else if (averageGradeValue >= 3.5) averageGrade = "A";
    else if (averageGradeValue >= 3.0) averageGrade = "B+";
    else if (averageGradeValue >= 2.5) averageGrade = "B";
    else if (averageGradeValue >= 2.0) averageGrade = "C+";
    else if (averageGradeValue >= 1.0) averageGrade = "C";
    else if (averageGradeValue > 0) averageGrade = "D";
    else if (gradedCount > 0) averageGrade = "F";

    const attendanceByDay: Record<string, { present: number; total: number }> = {};
    for (const a of attendanceRecords) {
      const dateStr = new Date(a.date).toISOString().split("T")[0];
      if (!attendanceByDay[dateStr]) {
        attendanceByDay[dateStr] = { present: 0, total: 0 };
      }
      attendanceByDay[dateStr].total++;
      if (a.status === "PRESENT") attendanceByDay[dateStr].present++;
    }

    const attendanceTrend: { date: string; percentage: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const dayData = attendanceByDay[dateStr];
      const percentage =
        dayData && dayData.total > 0
          ? Math.round((dayData.present / dayData.total) * 100)
          : 0;
      attendanceTrend.push({
        date: dateStr,
        percentage,
      });
    }

    return NextResponse.json({
      attendancePercentage,
      upcomingAssignments: assignments.length,
      averageGrade,
      upcomingExams: assignments.length,
      todayClasses: timetableSlots.map((slot) => ({
        id: slot.id,
        subject: slot.classSubject.subject.name,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
      recentGrades,
      attendanceTrend,
    });
  } catch (error) {
    console.error("Student stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
