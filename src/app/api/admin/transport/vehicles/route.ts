export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      include: {
        _count: {
          select: { routes: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Get vehicles error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, plateNumber, capacity, driverName, driverPhone, type } = await request.json();

    if (!name || !plateNumber || !capacity) {
      return NextResponse.json({ error: "Name, plate number, and capacity are required" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
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
    console.error("Create vehicle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
