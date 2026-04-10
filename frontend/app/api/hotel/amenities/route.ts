import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { hotelId, notasAdicionales, ...amenities } = data;

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

    // Construir objeto de amenities con solo los campos válidos
    const validAmenities: any = {
      piscina: amenities.piscina || false,
      pistasTenis: amenities.pistasTenis || false,
      padel: amenities.padel || false,
      gimnasio: amenities.gimnasio || false,
      restaurante: amenities.restaurante || false,
      bar: amenities.bar || false,
      spa: amenities.spa || false,
      sauna: amenities.sauna || false,
      buffet: amenities.buffet || false,
      wifiGratis: amenities.wifiGratis || false,
      estacionamientoGratis: amenities.estacionamientoGratis || false,
      habitacionesVIP: amenities.habitacionesVIP || false,
      permiteMascotas: amenities.permiteMascotas || false,
      salaJuegos: amenities.salaJuegos || false,
      guarderia: amenities.guarderia || false,
      accesibilidad: amenities.accesibilidad || false,
      idiomas: amenities.idiomas || false,
      actividades: amenities.actividades || false,
      sitioFumar: amenities.sitioFumar || false,
      earlyCheckin: amenities.earlyCheckin || false,
      lateCheckin: amenities.lateCheckin || false,
      notasAdicionales: notasAdicionales || null,
    };

    // Guardar o actualizar amenities
    const result = await prisma.hotelAmenities.upsert({
      where: { hotelId },
      update: validAmenities,
      create: {
        hotelId,
        ...validAmenities,
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
