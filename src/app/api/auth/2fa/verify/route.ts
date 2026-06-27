import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const twoFactorCode = await prisma.twoFactorCode.findFirst({
      where: {
        userId: session.user.id,
        code: code.trim(),
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!twoFactorCode) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    await prisma.twoFactorCode.update({
      where: { id: twoFactorCode.id },
      data: { used: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
