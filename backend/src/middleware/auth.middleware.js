import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ status: "error", message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: "error", message: "Token expired" });
    }
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.userType === "admin") {
    next();
  } else {
    return res.status(403).json({ status: "error", message: "Forbidden: Super Admin access required" });
  }
};
