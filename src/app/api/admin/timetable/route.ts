import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slots = await prisma.timetableSlot.findMany({
      include: {
        class: true,
        classSubject: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: {
                  select: { fullName: true },
                },
              },
            },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Get timetable error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
