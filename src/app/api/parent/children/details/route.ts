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
            user: {
              select: { fullName: true },
            },
            attendance: true,
            results: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            invoices: {
              where: { status: { not: "PAID" as const } },
              take: 1,
            },
          },
        },
      },
    });

    const children = parentStudents.map((ps: typeof parentStudents[0]) => {
      const student = ps.student;
      const totalAttendance = student.attendance.length;
      const presentAttendance = student.attendance.filter(
        (a: typeof student.attendance[0]) => a.status === "PRESENT"
      ).length;

      return {
        id: student.id,
        user: student.user,
        admissionNumber: student.admissionNumber,
        attendance: {
          total: totalAttendance,
          present: presentAttendance,
        },
        latestResult: student.results[0] || null,
        feeStatus: student.invoices[0]?.status || "PAID",
      };
    });

    return NextResponse.json(children);
  } catch (error) {
    console.error("Get children details error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
