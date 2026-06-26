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

    const classes = await prisma.class.findMany({
      include: {
        homeroomTeacher: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Get classes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, academicYear } = await request.json();

    const cls = await prisma.class.create({
      data: {
        name,
        academicYear,
      },
    });

    return NextResponse.json(cls);
  } catch (error) {
    console.error("Create class error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await request.json();
    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    await prisma.class.delete({ where: { id: classId } });

    return NextResponse.json({ message: "Class deleted" });
  } catch (error) {
    console.error("Delete class error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
