import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        twoFactorCodes: {
          where: {
            used: false,
            expiresAt: { gt: new Date() },
          },
          take: 1,
          select: { id: true },
        },
      },
      orderBy: { fullName: "asc" },
    });

    const usersWith2FA = users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorCodes.length > 0,
    }));

    return NextResponse.json({ users: usersWith2FA });
  } catch (error) {
    console.error("Admin 2FA list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, enable } = await request.json();

    if (!userId || typeof enable !== "boolean") {
      return NextResponse.json(
        { error: "userId and enable flag are required" },
        { status: 400 }
      );
    }

    if (enable) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await prisma.twoFactorCode.create({
        data: {
          userId,
          code,
          expiresAt,
        },
      });

      return NextResponse.json({ success: true, code });
    } else {
      await prisma.twoFactorCode.deleteMany({
        where: {
          userId,
          used: false,
        },
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Admin 2FA toggle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
