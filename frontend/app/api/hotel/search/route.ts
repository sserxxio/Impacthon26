import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Ingresa al menos 2 caracteres" },
        { status: 400 }
      );
    }

    const hotels = await prisma.hotel.findMany({
      where: {
        OR: [
          { hotelName: { contains: query } },
          { country: { contains: query } },
        ],
      },
      select: {
        id: true,
        hotelName: true,
        country: true,
        stars: true,
      },
      take: 20,
    });

    return NextResponse.json(hotels);
  } catch (error) {
    console.error("Error en buscador:", error);
    return NextResponse.json(
      { error: "Error al buscar hoteles" },
      { status: 500 }
    );
  }
}
