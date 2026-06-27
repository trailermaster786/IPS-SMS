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
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const classSubjects = await prisma.classSubject.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: {
          include: {
            students: {
              include: {
                user: { select: { id: true, fullName: true, email: true, role: true } },
                parents: {
                  include: {
                    parent: {
                      include: {
                        user: { select: { id: true, fullName: true, email: true, role: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const contactsMap = new Map<string, { id: string; fullName: string; email: string; role: string }>();

    for (const cs of classSubjects) {
      for (const student of cs.class.students) {
        contactsMap.set(student.user.id, {
          id: student.user.id,
          fullName: student.user.fullName,
          email: student.user.email,
          role: "STUDENT",
        });
        for (const ps of student.parents) {
          const parentUser = ps.parent.user;
          contactsMap.set(parentUser.id, {
            id: parentUser.id,
            fullName: parentUser.fullName,
            email: parentUser.email,
            role: "PARENT",
          });
        }
      }
    }

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, fullName: true, email: true, role: true },
    });
    for (const admin of admins) {
      contactsMap.set(admin.id, admin);
    }

    return NextResponse.json(Array.from(contactsMap.values()));
  } catch (error) {
    console.error("Get teacher contacts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
