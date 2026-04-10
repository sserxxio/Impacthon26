const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('hotelAmenities exists?', !!prisma.hotelAmenities);
  if (prisma.hotelAmenities) {
    const res = await prisma.hotelAmenities.findUnique({ where: { id: -1 } }).catch(() => "not found but object exists");
    console.log(res);
  }
}
main();
