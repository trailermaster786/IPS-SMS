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
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const remainingAmount = invoice.amountDue - invoice.amountPaid;

    await prisma.invoice.update({
      where: { id },
      data: {
        amountPaid: invoice.amountDue,
        status: "PAID",
      },
    });

    // Find the actual parent of this student
    const parentStudent = await prisma.parentStudent.findFirst({
      where: { studentId: invoice.studentId },
    });

    if (parentStudent) {
      await prisma.payment.create({
        data: {
          invoiceId: id,
          parentId: parentStudent.parentId,
          amount: remainingAmount,
          method: "cash",
          status: "succeeded",
        },
      });
    }

    return NextResponse.json({ message: "Invoice marked as paid" });
  } catch (error) {
    console.error("Mark as paid error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
