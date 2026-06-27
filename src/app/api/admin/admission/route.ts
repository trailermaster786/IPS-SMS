export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const admissionSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  admissionNumber: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.string().optional(),
  address: z.string().optional(),
  classId: z.string().optional(),
  parentEmail: z.string().email().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentOccupation: z.string().optional(),
  relation: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const students = await prisma.student.findMany({
      include: {
        user: {
          select: { fullName: true, email: true, createdAt: true },
        },
        class: {
          select: { name: true },
        },
        parents: {
          include: {
            parent: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { enrollmentDate: "desc" },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Get admissions error:", error);
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
    const parsed = admissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      fullName,
      email,
      password,
      phone,
      admissionNumber,
      dateOfBirth,
      gender,
      address,
      classId,
      parentEmail,
      parentName,
      parentPhone,
      parentOccupation,
      relation,
    } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const existingAdmission = await prisma.student.findUnique({
      where: { admissionNumber },
    });
    if (existingAdmission) {
      return NextResponse.json(
        { error: "Admission number already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          role: "STUDENT",
          phone,
          mustChangePassword: true,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          admissionNumber,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          address,
          classId: classId || null,
        },
      });

      let parentLink = null;
      if (parentEmail && parentName) {
        let parentUser = await tx.user.findUnique({
          where: { email: parentEmail },
        });

        if (!parentUser) {
          const parentPassword = await bcrypt.hash("parent123", 12);
          parentUser = await tx.user.create({
            data: {
              email: parentEmail,
              password: parentPassword,
              fullName: parentName,
              role: "PARENT",
              phone: parentPhone,
              mustChangePassword: true,
            },
          });

          await tx.parent.create({
            data: {
              userId: parentUser.id,
              occupation: parentOccupation,
            },
          });
        }

        const existingParent = await tx.parent.findUnique({
          where: { userId: parentUser.id },
        });

        if (existingParent) {
          parentLink = await tx.parentStudent.create({
            data: {
              parentId: existingParent.id,
              studentId: student.id,
              relation: relation || "Parent",
            },
          });
        }
      }

      return { user, student, parentLink };
    });

    return NextResponse.json({
      id: result.student.id,
      admissionNumber: result.student.admissionNumber,
      fullName: result.user.fullName,
      email: result.user.email,
      message: "Student admitted successfully",
    });
  } catch (error) {
    console.error("Create admission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
