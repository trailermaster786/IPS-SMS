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

    const students = await prisma.student.findMany({
      include: {
        user: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { admissionNumber: "asc" },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Get students error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
