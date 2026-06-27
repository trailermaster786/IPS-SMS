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

    const loans = await prisma.bookLoan.findMany({
      include: {
        copy: {
          include: { book: true },
        },
        student: {
          include: { user: true },
        },
      },
      orderBy: { loanDate: "desc" },
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error("Get loans error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, bookId, dueDate } = await request.json();

    if (!studentId || !bookId || !dueDate) {
      return NextResponse.json(
        { error: "Student, book, and due date are required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { userId: studentId },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { copies: true },
    });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.availableCopies <= 0) {
      return NextResponse.json(
        { error: "No copies available for this book" },
        { status: 400 }
      );
    }

    const availableCopy = await prisma.bookCopy.findFirst({
      where: {
        bookId,
        status: "AVAILABLE",
      },
    });

    if (!availableCopy) {
      return NextResponse.json(
        { error: "No available copy found" },
        { status: 400 }
      );
    }

    const loan = await prisma.$transaction([
      prisma.bookLoan.create({
        data: {
          copyId: availableCopy.id,
          studentId: student.id,
          dueDate: new Date(dueDate),
          status: "BORROWED",
        },
        include: {
          copy: { include: { book: true } },
          student: { include: { user: true } },
        },
      }),
      prisma.bookCopy.update({
        where: { id: availableCopy.id },
        data: { status: "BORROWED" },
      }),
      prisma.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json(loan[0], { status: 201 });
  } catch (error) {
    console.error("Create loan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
