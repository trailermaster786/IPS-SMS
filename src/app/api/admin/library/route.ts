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

    const books = await prisma.book.findMany({
      include: {
        copies: {
          include: {
            loans: {
              where: { status: "BORROWED" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const booksWithStats = books.map((book) => ({
      ...book,
      activeLoansCount: book.copies.reduce((sum, copy) => sum + copy.loans.length, 0),
    }));

    return NextResponse.json(booksWithStats);
  } catch (error) {
    console.error("Get library books error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, author, isbn, category, publisher, publishYear, totalCopies } =
      await request.json();

    if (!title || !author || !isbn) {
      return NextResponse.json(
        { error: "Title, author, and ISBN are required" },
        { status: 400 }
      );
    }

    const existingBook = await prisma.book.findUnique({ where: { isbn } });
    if (existingBook) {
      return NextResponse.json(
        { error: "A book with this ISBN already exists" },
        { status: 400 }
      );
    }

    const copiesCount = Math.max(1, Number(totalCopies) || 1);

    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        category: category || null,
        publisher: publisher || null,
        publishYear: publishYear ? Number(publishYear) : null,
        totalCopies: copiesCount,
        availableCopies: copiesCount,
        copies: {
          create: Array.from({ length: copiesCount }, (_, i) => ({
            barcode: `BOOK-${isbn}-${i + 1}`,
            status: "AVAILABLE",
          })),
        },
      },
      include: { copies: true },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("Create book error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
