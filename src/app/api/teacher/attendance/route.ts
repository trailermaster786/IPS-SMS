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

    const { attendance } = await request.json();

    for (const record of attendance) {
      await prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: record.studentId,
            date: new Date(record.date),
          },
        },
        update: {
          status: record.status,
        },
        create: {
          studentId: record.studentId,
          classId: record.classId,
          date: new Date(record.date),
          status: record.status,
        },
      });
    }

    return NextResponse.json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Mark attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
