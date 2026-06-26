import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "PARENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    const { id } = await params;

    // Verify the student belongs to this parent
    const isChild = await prisma.parentStudent.findUnique({
      where: { parentId_studentId: { parentId: parent.id, studentId: id } },
    });

    if (!isChild) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { studentId: id },
      include: {
        feeStructure: true,
        student: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Get invoices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
