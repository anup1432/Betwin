import jwt from "jsonwebtoken";
import cfg from "../config.js";  // default import

const adminAuth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token, auth denied" });

    const decoded = jwt.verify(token, cfg.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token is not valid" });
  }
};

export default adminAuth;
