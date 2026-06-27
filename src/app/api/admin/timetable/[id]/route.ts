export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const slotUpdateSchema = z.object({
  classId: z.string().min(1).optional(),
  classSubjectId: z.string().min(1).optional(),
  dayOfWeek: z.number().min(0).max(4).optional(),
  startTime: z.string().min(1).optional(),
  endTime: z.string().min(1).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = slotUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.timetableSlot.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    const updateData = parsed.data;

    if (updateData.startTime && updateData.endTime && (updateData.classId || updateData.dayOfWeek)) {
      const classId = updateData.classId || existing.classId;
      const dayOfWeek = updateData.dayOfWeek ?? existing.dayOfWeek;
      const startTime = updateData.startTime;
      const endTime = updateData.endTime;

      const conflictingSlot = await prisma.timetableSlot.findFirst({
        where: {
          id: { not: id },
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
    }

    const slot = await prisma.timetableSlot.update({
      where: { id },
      data: updateData,
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
    console.error("Update timetable slot error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.timetableSlot.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    await prisma.timetableSlot.delete({ where: { id } });

    return NextResponse.json({ message: "Slot deleted" });
  } catch (error) {
    console.error("Delete timetable slot error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
