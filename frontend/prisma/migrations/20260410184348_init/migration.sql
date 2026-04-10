-- CreateTable
CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guestId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "gender" TEXT,
    "ageRange" TEXT,
    "last2Years" INTEGER NOT NULL DEFAULT 0,
    "confirmedBookings" INTEGER NOT NULL DEFAULT 0,
    "numDistinctions" INTEGER NOT NULL DEFAULT 0,
    "confirmedCancels" REAL NOT NULL DEFAULT 0,
    "avgLength" REAL NOT NULL DEFAULT 0,
    "avgBookingValue" REAL NOT NULL DEFAULT 0,
    "avgScore" REAL NOT NULL DEFAULT 0,
    "reservationId" INTEGER,
    "checkinDate" TEXT,
    "checkoutDate" TEXT,
    "hotelId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hotelDbId" INTEGER NOT NULL,
    "hotelName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "brand" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "numRooms" INTEGER NOT NULL DEFAULT 0,
    "cityName" TEXT,
    "cityClimate" TEXT,
    "cityAvgTemp" REAL NOT NULL DEFAULT 0,
    "cityRain" TEXT,
    "cityBeach" TEXT,
    "cityMountain" TEXT,
    "cityHistoric" TEXT,
    "cityPrice" TEXT,
    "cityGastro" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_guestId_key" ON "Customer"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_hotelDbId_key" ON "Hotel"("hotelDbId");
