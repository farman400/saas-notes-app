import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../../../lib/auth";

const prisma = new PrismaClient();

export default requireAuth(async function handler(req, res) {
  const { method } = req;
  const { userId, tenantId } = req.auth;

  if (method === "GET") {
    // List all notes for tenant
    const notes = await prisma.note.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
    return res.json(notes);
  }

  if (method === "POST") {
    // Check tenant’s plan
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const count = await prisma.note.count({ where: { tenantId } });

    if (tenant.plan === "FREE" && count >= 3) {
      return res.status(403).json({ error: "Free plan limit reached (3 notes)" });
    }

    const { title, content } = req.body;
    const note = await prisma.note.create({
      data: { title, content, tenantId, userId },
    });

    return res.status(201).json(note);
  }

  return res.status(405).end();
});
