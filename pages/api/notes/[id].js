import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../../../lib/auth";

const prisma = new PrismaClient();

export default requireAuth(async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  const { tenantId } = req.auth;

  if (method === "GET") {
    const note = await prisma.note.findFirst({ where: { id, tenantId } });
    if (!note) return res.status(404).json({ error: "Not found" });
    return res.json(note);
  }

  if (method === "PUT") {
    const { title, content } = req.body;
    const updated = await prisma.note.updateMany({
      where: { id, tenantId },
      data: { title, content },
    });
    if (updated.count === 0) return res.status(404).json({ error: "Not found" });
    return res.json({ success: true });
  }

  if (method === "DELETE") {
    const deleted = await prisma.note.deleteMany({ where: { id, tenantId } });
    if (deleted.count === 0) return res.status(404).json({ error: "Not found" });
    return res.json({ success: true });
  }

  return res.status(405).end();
});
