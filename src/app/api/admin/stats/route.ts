export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const [
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      invoices,
      attendanceRecords,
      recentActivity,
      gradeDistribution,
      monthlyEnrollments,
      classPerformance,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.parent.count(),
      prisma.class.count(),

      prisma.invoice.findMany({
        select: {
          amountDue: true,
          amountPaid: true,
          status: true,
          dueDate: true,
        },
      }),

      prisma.attendance.findMany({
        where: {
          date: { gte: thirtyDaysAgo },
        },
        select: { status: true },
      }),

      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          details: true,
          createdAt: true,
          user: { select: { fullName: true } },
        },
      }),

      prisma.result.groupBy({
        by: ["grade"],
        _count: { id: true },
        where: { grade: { not: null } },
      }),

      prisma.student.findMany({
        where: {
          enrollmentDate: { gte: sixMonthsAgo },
        },
        select: { enrollmentDate: true },
        orderBy: { enrollmentDate: "asc" },
      }),

      prisma.class.findMany({
        select: {
          id: true,
          name: true,
          students: {
            select: {
              results: {
                select: { marksObtained: true, totalMarks: true },
              },
            },
          },
        },
      }),
    ]);

    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;

    for (const inv of invoices) {
      totalCollected += inv.amountPaid;
      const remaining = inv.amountDue - inv.amountPaid;
      if (remaining > 0) {
        if (new Date(inv.dueDate) < now && inv.status !== "PAID") {
          totalOverdue += remaining;
        } else {
          totalOutstanding += remaining;
        }
      }
    }

    const presentCount = attendanceRecords.filter(
      (a) => a.status === "PRESENT"
    ).length;
    const attendanceRate =
      attendanceRecords.length > 0
        ? Math.round((presentCount / attendanceRecords.length) * 100)
        : 0;

    const gradeMap: Record<string, number> = {};
    for (const g of gradeDistribution) {
      if (g.grade) gradeMap[g.grade] = g._count.id;
    }
    const gradeDistFormatted = [
      "A+",
      "A",
      "B+",
      "B",
      "C+",
      "C",
      "D",
      "F",
    ].map((grade) => ({
      grade,
      count: gradeMap[grade] || 0,
    }));

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const enrollmentByMonth: Record<string, number> = {};
    for (const s of monthlyEnrollments) {
      const d = new Date(s.enrollmentDate);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      enrollmentByMonth[key] = (enrollmentByMonth[key] || 0) + 1;
    }
    const monthlyEnrollmentsFormatted = Object.entries(enrollmentByMonth).map(
      ([month, count]) => ({ month, count })
    );

    const classPerformanceFormatted = classPerformance.map((cls) => {
      let totalMarks = 0;
      let totalObtained = 0;
      for (const student of cls.students) {
        for (const result of student.results) {
          totalMarks += result.totalMarks;
          totalObtained += result.marksObtained;
        }
      }
      return {
        class: cls.name,
        average:
          totalMarks > 0
            ? Math.round((totalObtained / totalMarks) * 100)
            : 0,
      };
    });

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      feeCollection: {
        totalCollected,
        totalOutstanding,
        totalOverdue,
      },
      attendanceRate,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        details: a.details,
        userName: a.user.fullName,
        createdAt: a.createdAt,
      })),
      gradeDistribution: gradeDistFormatted,
      monthlyEnrollments: monthlyEnrollmentsFormatted,
      classPerformance: classPerformanceFormatted,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
