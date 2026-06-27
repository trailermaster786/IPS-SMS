export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "PARENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    const parentStudents = await prisma.parentStudent.findMany({
      where: { parentId: parent.id },
      include: {
        student: {
          include: {
            class: true,
            user: { select: { fullName: true } },
            attendance: {
              select: { status: true },
            },
            results: {
              select: {
                marksObtained: true,
                totalMarks: true,
                grade: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" as const },
              take: 10,
            },
            invoices: {
              select: {
                amountDue: true,
                amountPaid: true,
                status: true,
                dueDate: true,
              },
            },
          },
        },
      },
    });

    const childrenCount = parentStudents.length;

    let totalOutstandingFees = 0;
    let totalAttendance = 0;
    let presentCount = 0;
    let totalPerformancePoints = 0;
    let gradedCount = 0;

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

    const childrenOverview = parentStudents.map((ps) => {
      const student = ps.student;

      let studentOutstanding = 0;
      for (const inv of student.invoices) {
        const remaining = inv.amountDue - inv.amountPaid;
        if (remaining > 0 && inv.status !== "PAID") {
          studentOutstanding += remaining;
        }
      }
      totalOutstandingFees += studentOutstanding;

      const studentTotal = student.attendance.length;
      const studentPresent = student.attendance.filter(
        (a: { status: string }) => a.status === "PRESENT"
      ).length;
      totalAttendance += studentTotal;
      presentCount += studentPresent;

      let studentPoints = 0;
      let studentGraded = 0;
      for (const r of student.results) {
        if (r.grade && gradePoints[r.grade] !== undefined) {
          studentPoints += gradePoints[r.grade];
          studentGraded++;
        }
      }
      totalPerformancePoints += studentPoints;
      gradedCount += studentGraded;

      const studentAttendancePct =
        studentTotal > 0
          ? Math.round((studentPresent / studentTotal) * 100)
          : 0;

      let latestGrade = "N/A";
      if (student.results.length > 0) {
        latestGrade = student.results[0].grade || "N/A";
      }

      const feeStatus = studentOutstanding > 0 ? "Pending" : "Paid";

      return {
        name: student.user.fullName,
        className: student.class?.name || "Unassigned",
        attendancePercentage: studentAttendancePct,
        latestGrade,
        feeStatus,
        outstandingAmount: studentOutstanding,
      };
    });

    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0;

    const avgPerformance =
      gradedCount > 0
        ? (() => {
            const avg = totalPerformancePoints / gradedCount;
            if (avg >= 3.8) return "A+";
            if (avg >= 3.5) return "A";
            if (avg >= 3.0) return "B+";
            if (avg >= 2.5) return "B";
            if (avg >= 2.0) return "C+";
            if (avg >= 1.0) return "C";
            if (avg > 0) return "D";
            return "F";
          })()
        : "N/A";

    const unpaidInvoices = parentStudents.flatMap((ps) =>
      ps.student.invoices
        .filter((inv: { amountDue: number; amountPaid: number; status: string }) => {
          const remaining = inv.amountDue - inv.amountPaid;
          return remaining > 0 && inv.status !== "PAID";
        })
        .map((inv: { amountDue: number; amountPaid: number; dueDate: Date }) => ({
          studentName: ps.student.user.fullName,
          amount: inv.amountDue - inv.amountPaid,
          dueDate: inv.dueDate,
        }))
    );

    return NextResponse.json({
      childrenCount,
      outstandingFees: totalOutstandingFees,
      avgPerformance,
      attendanceRate,
      childrenOverview,
      feeReminders: unpaidInvoices,
    });
  } catch (error) {
    console.error("Parent stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
