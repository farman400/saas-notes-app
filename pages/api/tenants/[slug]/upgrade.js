import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "../../../../lib/auth";

const prisma = new PrismaClient();

export default requireAdmin(async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;

  if (method !== "POST") return res.status(405).end();

  // Update tenant’s plan
  const tenant = await prisma.tenant.update({
    where: { slug },
    data: { plan: "PRO" },
  });

  return res.json({
    message: `Tenant ${tenant.name} upgraded to PRO`,
    tenant,
  });
});
