// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.note.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Create tenants
  const acme = await prisma.tenant.create({
    data: { name: "Acme", slug: "acme", plan: "FREE" },
  });
  const globex = await prisma.tenant.create({
    data: { name: "Globex", slug: "globex", plan: "FREE" },
  });

  // Hash password
  const hashed = await bcrypt.hash("password", 10);

  // Create users
  await prisma.user.createMany({
    data: [
      { email: "admin@acme.test", password: hashed, role: "ADMIN", tenantId: acme.id },
      { email: "user@acme.test", password: hashed, role: "MEMBER", tenantId: acme.id },
      { email: "admin@globex.test", password: hashed, role: "ADMIN", tenantId: globex.id },
      { email: "user@globex.test", password: hashed, role: "MEMBER", tenantId: globex.id },
    ],
  });

  console.log("✅ Seed complete: tenants + users created with bcrypt hashes");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
