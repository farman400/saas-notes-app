// lib/auth.js
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "dev-secret";

// Verify token and fetch user
async function getAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return null;

    return { userId: user.id, tenantId: user.tenantId, role: user.role };
  } catch (err) {
    return null;
  }
}

// Require any authenticated user
function requireAuth(handler) {
  return async (req, res) => {
    const auth = await getAuth(req);
    if (!auth) return res.status(401).json({ error: "Unauthorized" });

    req.auth = auth; // attach to request
    return handler(req, res);
  };
}

// Require admin only
function requireAdmin(handler) {
  return requireAuth(async (req, res) => {
    if (req.auth.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    return handler(req, res);
  });
}

module.exports = { requireAuth, requireAdmin };
