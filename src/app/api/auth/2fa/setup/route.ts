import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await prisma.twoFactorCode.create({
      data: {
        userId: session.user.id,
        code,
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeCode = await prisma.twoFactorCode.findFirst({
      where: {
        userId: session.user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    return NextResponse.json({ hasActiveCode: !!activeCode });
  } catch (error) {
    console.error("2FA status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
