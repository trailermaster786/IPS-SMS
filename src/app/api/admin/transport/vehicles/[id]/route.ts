export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, plateNumber, capacity, driverName, driverPhone, type } = await request.json();

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        name,
        plateNumber,
        capacity: parseInt(capacity, 10),
        driverName: driverName || null,
        driverPhone: driverPhone || null,
        type: type || "Bus",
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Update vehicle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.vehicle.delete({ where: { id } });

    return NextResponse.json({ message: "Vehicle deleted" });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
