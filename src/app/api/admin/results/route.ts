import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await prisma.result.findMany({
      include: {
        student: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
        classSubject: {
          include: {
            subject: true,
            class: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Get results error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
