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
    const { name, vehicleId, stops, departureTime, arrivalTime } = await request.json();

    const route = await prisma.route.update({
      where: { id },
      data: {
        name,
        vehicleId,
        stops,
        departureTime,
        arrivalTime,
      },
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json(route);
  } catch (error) {
    console.error("Update route error:", error);
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

    await prisma.studentRoute.deleteMany({ where: { routeId: id } });
    await prisma.route.delete({ where: { id } });

    return NextResponse.json({ message: "Route deleted" });
  } catch (error) {
    console.error("Delete route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
