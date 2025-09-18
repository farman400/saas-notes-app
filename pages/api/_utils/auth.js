import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret"; // set JWT_SECRET in .env for production

// Generate token
export function signToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
    SECRET,
    { expiresIn: "1h" }
  );
}

// Verify token
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

// Middleware-style auth checker
export function requireAuth(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = decoded; // attach user info
    return handler(req, res);
  };
}
