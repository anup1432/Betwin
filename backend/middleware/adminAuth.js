import jwt from "jsonwebtoken";
import cfg from "../config.js";

export const requireAdmin = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, cfg.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
