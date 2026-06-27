export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const slotSchema = z.object({
  classId: z.string().min(1),
  classSubjectId: z.string().min(1),
  dayOfWeek: z.number().min(0).max(4),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

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

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = slotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { classId, classSubjectId, dayOfWeek, startTime, endTime } = parsed.data;

    const conflictingSlot = await prisma.timetableSlot.findFirst({
      where: {
        classId,
        dayOfWeek,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (conflictingSlot) {
      return NextResponse.json(
        { error: "Time slot conflicts with an existing entry" },
        { status: 400 }
      );
    }

    const slot = await prisma.timetableSlot.create({
      data: {
        classId,
        classSubjectId,
        dayOfWeek,
        startTime,
        endTime,
      },
      include: {
        class: true,
        classSubject: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: { select: { fullName: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(slot);
  } catch (error) {
    console.error("Create timetable slot error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
