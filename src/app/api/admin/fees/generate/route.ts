export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const generateSchema = z.object({
  feeStructureId: z.string().min(1),
  studentIds: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { feeStructureId, studentIds } = parsed.data;

    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
    });

    if (!feeStructure) {
      return NextResponse.json({ error: "Fee structure not found" }, { status: 404 });
    }

    const existingInvoices = await prisma.invoice.findMany({
      where: {
        feeStructureId,
        studentId: { in: studentIds },
      },
      select: { studentId: true },
    });

    const existingStudentIds = new Set(existingInvoices.map((i) => i.studentId));
    const newStudentIds = studentIds.filter((id) => !existingStudentIds.has(id));

    if (newStudentIds.length === 0) {
      return NextResponse.json(
        { error: "All selected students already have invoices for this fee structure" },
        { status: 400 }
      );
    }

    const invoices = await prisma.$transaction(
      newStudentIds.map((studentId) =>
        prisma.invoice.create({
          data: {
            studentId,
            feeStructureId,
            amountDue: feeStructure.amount,
            amountPaid: 0,
            status: "PENDING",
            dueDate: feeStructure.dueDate,
          },
        })
      )
    );

    return NextResponse.json({
      message: `${invoices.length} invoice(s) created successfully`,
      count: invoices.length,
    });
  } catch (error) {
    console.error("Generate invoices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
