export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        copies: {
          include: {
            loans: {
              orderBy: { loanDate: "desc" },
              include: {
                student: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Get book error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const { title, author, isbn, category, publisher, publishYear } =
      await request.json();

    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (isbn && isbn !== existingBook.isbn) {
      const duplicate = await prisma.book.findUnique({ where: { isbn } });
      if (duplicate) {
        return NextResponse.json(
          { error: "A book with this ISBN already exists" },
          { status: 400 }
        );
      }
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        title: title ?? existingBook.title,
        author: author ?? existingBook.author,
        isbn: isbn ?? existingBook.isbn,
        category: category !== undefined ? category : existingBook.category,
        publisher: publisher !== undefined ? publisher : existingBook.publisher,
        publishYear: publishYear !== undefined ? (publishYear ? Number(publishYear) : null) : existingBook.publishYear,
      },
      include: { copies: true },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error("Update book error:", error);
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

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        copies: {
          include: {
            loans: { where: { status: "BORROWED" } },
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const hasActiveLoans = book.copies.some((copy) => copy.loans.length > 0);
    if (hasActiveLoans) {
      return NextResponse.json(
        { error: "Cannot delete book with active loans" },
        { status: 400 }
      );
    }

    await prisma.book.delete({ where: { id } });

    return NextResponse.json({ message: "Book deleted" });
  } catch (error) {
    console.error("Delete book error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
