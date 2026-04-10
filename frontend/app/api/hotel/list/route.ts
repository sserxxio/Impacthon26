import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const hotels = await prisma.hotel.findMany({
      select: {
        id: true,
        hotelName: true,
        country: true,
        stars: true,
      },
      orderBy: {
        hotelName: "asc",
      },
    });

    return NextResponse.json(hotels);
  } catch (error) {
    console.error("Error en GET /api/hotel/list:", error);
    return NextResponse.json(
      { error: "Error al obtener hoteles" },
      { status: 500 }
    );
  }
}
