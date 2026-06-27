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
      include: {
        children: {
          include: {
            student: {
              include: {
                user: { select: { id: true, fullName: true, email: true, role: true } },
                class: {
                  include: {
                    classSubjects: {
                      include: {
                        teacher: {
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
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    const contactsMap = new Map<string, { id: string; fullName: string; email: string; role: string }>();

    for (const ps of parent.children) {
      const studentUser = ps.student.user;
      contactsMap.set(studentUser.id, {
        id: studentUser.id,
        fullName: studentUser.fullName,
        email: studentUser.email,
        role: "STUDENT",
      });

      if (ps.student.class) {
        for (const cs of ps.student.class.classSubjects) {
          const teacherUser = cs.teacher.user;
          contactsMap.set(teacherUser.id, {
            id: teacherUser.id,
            fullName: teacherUser.fullName,
            email: teacherUser.email,
            role: "TEACHER",
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
    console.error("Get parent contacts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
