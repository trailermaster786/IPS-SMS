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

    const children = await prisma.parentStudent.findMany({
      where: { parentId: parent.id },
      include: {
        student: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    return NextResponse.json(children.map((c: typeof children[0]) => c.student));
  } catch (error) {
    console.error("Get children error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
