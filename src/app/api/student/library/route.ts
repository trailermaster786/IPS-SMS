export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const books = await prisma.book.findMany({
      where: {
        availableCopies: { gt: 0 },
      },
      include: {
        copies: {
          where: { status: "AVAILABLE" },
        },
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Get student library error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
