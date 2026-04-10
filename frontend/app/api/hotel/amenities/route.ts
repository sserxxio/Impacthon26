import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { hotelId, ...amenities } = data;

    // Verificar que el hotel existe
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json(
        { error: "Hotel no encontrado" },
        { status: 404 }
      );
    }

    // Guardar o actualizar amenities
    const result = await prisma.hotelAmenities.upsert({
      where: { hotelId },
      update: amenities,
      create: {
        hotelId,
        ...amenities,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en /api/hotel/amenities:", error);
    return NextResponse.json(
      { error: "Error al guardar servicios" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const hotelId = req.nextUrl.searchParams.get("hotelId");

    if (!hotelId) {
      return NextResponse.json(
        { error: "hotelId requerido" },
        { status: 400 }
      );
    }

    const amenities = await prisma.hotelAmenities.findUnique({
      where: { hotelId: parseInt(hotelId) },
    });

    return NextResponse.json(amenities || {});
  } catch (error) {
    console.error("Error en GET /api/hotel/amenities:", error);
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 }
    );
  }
}
