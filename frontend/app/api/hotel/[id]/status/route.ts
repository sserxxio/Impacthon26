import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hotelId = parseInt(id);

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: {
        id: true,
        hotelName: true,
        country: true,
        stars: true,
      },
    });

    if (!hotel) {
      return NextResponse.json(
        { error: "Hotel no encontrado" },
        { status: 404 }
      );
    }

    const amenities = await prisma.hotelAmenities.findUnique({
      where: { hotelId },
    });

    const hasAmenities = !!amenities;

    return NextResponse.json({
      hotel,
      hasAmenities,
      status: hasAmenities ? "configured" : "pending",
    });
  } catch (error) {
    console.error("Error en status:", error);
    return NextResponse.json(
      { error: "Error al verificar estado" },
      { status: 500 }
    );
  }
}
