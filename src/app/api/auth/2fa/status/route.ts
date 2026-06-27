import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

    return NextResponse.json({ enabled: !!activeCode });
  } catch (error) {
    console.error("2FA status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
