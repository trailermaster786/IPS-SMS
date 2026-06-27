export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, routeId, stopName } = await request.json();

    if (!studentId || !routeId) {
      return NextResponse.json({ error: "Student ID and Route ID are required" }, { status: 400 });
    }

    const existing = await prisma.studentRoute.findUnique({
      where: {
        studentId_routeId: { studentId, routeId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Student is already assigned to this route" }, { status: 409 });
    }

    const studentRoute = await prisma.studentRoute.create({
      data: {
        studentId,
        routeId,
        stopName: stopName || null,
      },
      include: {
        student: {
          include: { user: { select: { fullName: true } } },
        },
        route: true,
      },
    });

    return NextResponse.json(studentRoute);
  } catch (error) {
    console.error("Assign student error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, routeId } = await request.json();

    if (!studentId || !routeId) {
      return NextResponse.json({ error: "Student ID and Route ID are required" }, { status: 400 });
    }

    await prisma.studentRoute.delete({
      where: {
        studentId_routeId: { studentId, routeId },
      },
    });

    return NextResponse.json({ message: "Student unassigned from route" });
  } catch (error) {
    console.error("Unassign student error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
