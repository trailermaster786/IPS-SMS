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

    const now = new Date();
    const dayOfWeek = now.getDay();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const classSubjects = await prisma.classSubject.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: {
          include: {
            students: true,
          },
        },
        subject: true,
      },
    });

    const classIds = classSubjects.map((cs) => cs.classId);

    const [assignments, timetableSlots, submissions, attendanceRecords] = await Promise.all([
      prisma.assignment.findMany({
        where: { teacherId: teacher.id },
        select: { id: true },
      }),

      prisma.timetableSlot.findMany({
        where: {
          classSubject: { teacherId: teacher.id },
          dayOfWeek,
        },
        include: {
          class: { select: { name: true } },
          classSubject: {
            include: { subject: { select: { name: true } } },
          },
        },
        orderBy: { startTime: "asc" },
      }),

      prisma.submission.findMany({
        where: {
          assignment: { teacherId: teacher.id },
        },
        take: 5,
        orderBy: { submittedAt: "desc" },
        include: {
          student: {
            include: { user: { select: { fullName: true } } },
          },
          assignment: { select: { title: true } },
        },
      }),

      prisma.attendance.findMany({
        where: {
          classId: { in: classIds },
          date: { gte: thirtyDaysAgo },
        },
        select: { status: true, classId: true },
      }),
    ]);

    const totalClasses = classSubjects.length;
    const totalStudents = classSubjects.reduce(
      (sum: number, cs: (typeof classSubjects)[number]) => sum + cs.class.students.length,
      0
    );
    const totalAssignments = assignments.length;

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((a: { status: string }) => a.status === "PRESENT").length;
    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0;

    const classAverages = await Promise.all(
      classSubjects.map(async (cs: (typeof classSubjects)[number]) => {
        const results = await prisma.result.findMany({
          where: { classSubjectId: cs.id },
          select: { marksObtained: true, totalMarks: true },
        });

        let totalObtained = 0;
        let totalPossible = 0;
        for (const r of results) {
          totalObtained += r.marksObtained;
          totalPossible += r.totalMarks;
        }

        return {
          class: cs.class.name,
          subject: cs.subject.name,
          average:
            totalPossible > 0
              ? Math.round((totalObtained / totalPossible) * 100)
              : 0,
        };
      })
    );

    return NextResponse.json({
      totalClasses,
      totalStudents,
      totalAssignments,
      attendanceRate,
      todaySchedule: timetableSlots.map((slot) => ({
        id: slot.id,
        className: slot.class.name,
        subject: slot.classSubject.subject.name,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
      recentSubmissions: submissions.map((sub) => ({
        id: sub.id,
        studentName: sub.student.user.fullName,
        assignmentTitle: sub.assignment.title,
        grade: sub.grade,
        submittedAt: sub.submittedAt,
      })),
      classAverages,
    });
  } catch (error) {
    console.error("Teacher stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
