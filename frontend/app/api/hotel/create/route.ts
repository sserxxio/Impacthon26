import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { hotelName, country, brand, stars, numRooms } = await req.json();

    // Validar campos requeridos
    if (!hotelName || !country) {
      return NextResponse.json(
        { error: "Nombre del hotel y país son requeridos" },
        { status: 400 }
      );
    }

    // Crear el hotel
    const newHotel = await prisma.hotel.create({
      data: {
        hotelDbId: Math.floor(Math.random() * 1000000), // ID único temporal
        hotelName: hotelName.trim(),
        country: country.trim(),
        brand: brand?.trim() || null,
        stars: parseInt(stars) || 0,
        numRooms: parseInt(numRooms) || 0,
      },
    });

    // Crear registro vacío de amenities para este hotel
    await prisma.hotelAmenities.create({
      data: {
        hotelId: newHotel.id,
      },
    });

    return NextResponse.json({
      id: newHotel.id,
      hotelName: newHotel.hotelName,
      country: newHotel.country,
      stars: newHotel.stars,
    });
  } catch (error) {
    console.error("Error creando hotel:", error);
    return NextResponse.json(
      { error: "Error al crear el hotel" },
      { status: 500 }
    );
  }
}
