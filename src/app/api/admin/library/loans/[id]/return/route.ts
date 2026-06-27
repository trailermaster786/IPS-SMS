export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const loan = await prisma.bookLoan.findUnique({
      where: { id },
      include: { copy: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (loan.status === "RETURNED") {
      return NextResponse.json({ error: "Book already returned" }, { status: 400 });
    }

    const result = await prisma.$transaction([
      prisma.bookLoan.update({
        where: { id },
        data: {
          returnDate: new Date(),
          status: "RETURNED",
        },
        include: {
          copy: { include: { book: true } },
          student: { include: { user: true } },
        },
      }),
      prisma.bookCopy.update({
        where: { id: loan.copyId },
        data: { status: "AVAILABLE" },
      }),
      prisma.book.update({
        where: { id: loan.copy.bookId },
        data: { availableCopies: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Return loan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
