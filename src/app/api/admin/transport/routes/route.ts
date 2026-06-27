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

    const routes = await prisma.route.findMany({
      include: {
        vehicle: true,
        _count: {
          select: { studentRoutes: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(routes);
  } catch (error) {
    console.error("Get routes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, vehicleId, stops, departureTime, arrivalTime } = await request.json();

    if (!name || !vehicleId || !stops || !departureTime || !arrivalTime) {
      return NextResponse.json(
        { error: "Name, vehicle, stops, departure time, and arrival time are required" },
        { status: 400 }
      );
    }

    const route = await prisma.route.create({
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
    console.error("Create route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
