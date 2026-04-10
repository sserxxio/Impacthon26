import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

async function main() {
  // ── CUSTOMERS ──
  const customerCSV = fs.readFileSync(
    path.join(process.cwd(), "data/customer_data_200.csv"),
    "utf-8"
  );

  const customerRows = parse(customerCSV, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ";",
    quote: '"',
    relax_quotes: true,
    trim: true,
  });

  const customers = customerRows.map((r: any) => ({
    guestId: r["GUEST_ID"],
    country: r["COUNTRY_GUEST"],
    gender: r["GENDER_ID"],
    ageRange: r["AGE_RANGE"],
    last2Years: parseInt(r["LAST_2_YEARS_STAYS"]) || 0,
    confirmedBookings: parseInt(r["CONFIRMED_RESERVATIONS"]) || 0,
    numDistinctions: parseInt(r["NUM_DISTINCT_HOTELS"]) || 0,
    confirmedCancels: parseFloat(r["CONFIRMED_RESERVATIONS_ADR"]) || 0,
    avgLength: parseFloat(r["AVG_LENGTH_STAY"]) || 0,
    avgBookingValue: parseFloat(r["AVG_BOOKING_LEADTIME"]) || 0,
    avgScore: parseFloat(r["AVG_SCORE"]) || 0,
    reservationId: parseInt(r["RESERVATION_ID"]) || null,
    checkinDate: r["CHECKIN_DATE"] || null,
    checkoutDate: r["CHECKOUT_DATE"] || null,
    hotelId: parseInt(r["HOTEL_ID"]) || null,
  }));

  // Deduplicar por guestId
  const uniqueCustomers = Array.from(
    new Map(customers.map((c) => [c.guestId, c])).values()
  );

  // ── HOTELS ──
  const hotelCSV = fs.readFileSync(
    path.join(process.cwd(), "data/hotel_data.csv"),
    "utf-8"
  );

  const hotelRows = parse(hotelCSV, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ";",
    quote: '"',
    relax_quotes: true,
    trim: true,
  });

  const hotels = hotelRows.map((r: any) => ({
    hotelDbId: parseInt(r["ID"]) || 0,
    hotelName: r["HOTEL_NAME"] || "",
    country: r["COUNTRY_ID"] || "",
    brand: r["BRAND"] || null,
    stars: parseInt(r["STARS"]) || 0,
    numRooms: parseInt(r["NUM_ROOMS"]) || 0,
    cityName: r["CITY_NAME"] || null,
    cityClimate: r["CITY_CLIMATE"] || null,
    cityAvgTemp: parseFloat(r["CITY_AVG_TEMPERATURE"]) || 0,
    cityRain: r["CITY_RAIN_RISK"] || null,
    cityBeach: r["CITY_BEACH_FLAG"] || null,
    cityMountain: r["CITY_MOUNTAIN_FLAG"] || null,
    cityHistoric: r["CITY_HISTORICAL_HERITAGE"] || null,
    cityPrice: r["CITY_PRICE_LEVEL"] || null,
    cityGastro: r["CITY_GASTRONOMY"] || null,
  }));

  // Deduplicar por hotelDbId
  const uniqueHotels = Array.from(
    new Map(hotels.map((h) => [h.hotelDbId, h])).values()
  );

  // Clear existing data
  await prisma.customer.deleteMany();
  await prisma.hotel.deleteMany();

  // Insert customers
  await prisma.customer.createMany({
    data: uniqueCustomers,
  });
  console.log(`✅ ${uniqueCustomers.length} clientes importados`);

  // Insert hotels
  await prisma.hotel.createMany({
    data: uniqueHotels,
  });
  console.log(`✅ ${uniqueHotels.length} hoteles importados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
