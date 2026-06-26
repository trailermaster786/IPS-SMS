import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Get subjects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, code } = await request.json();

    const existingSubject = await prisma.subject.findUnique({
      where: { code },
    });

    if (existingSubject) {
      return NextResponse.json({ error: "Subject code already exists" }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: { name, code },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Create subject error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId } = await request.json();
    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 });
    }

    await prisma.subject.delete({ where: { id: subjectId } });

    return NextResponse.json({ message: "Subject deleted" });
  } catch (error) {
    console.error("Delete subject error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
