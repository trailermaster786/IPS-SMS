export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const structureSchema = z.object({
  classId: z.string().optional(),
  name: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  term: z.string().min(1),
  dueDate: z.string(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const structures = await prisma.feeStructure.findMany({
      include: {
        class: {
          select: { name: true },
        },
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { dueDate: "desc" },
    });

    return NextResponse.json(structures);
  } catch (error) {
    console.error("Get fee structures error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = structureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { classId, name, amount, currency, term, dueDate } = parsed.data;

    const structure = await prisma.feeStructure.create({
      data: {
        classId: classId || null,
        name,
        amount,
        currency,
        term,
        dueDate: new Date(dueDate),
      },
      include: {
        class: { select: { name: true } },
      },
    });

    return NextResponse.json(structure);
  } catch (error) {
    console.error("Create fee structure error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
