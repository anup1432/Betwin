// backend/routes/admin.js
import express from "express";
const router = express.Router();

// Example: Admin login
router.post("/login", (req, res) => {
  res.json({ message: "Admin logged in successfully!" });
});

// Example: Get all users
router.get("/users", (req, res) => {
  res.json({ message: "Here is the list of all users" });
});

// Example: Manage battles
router.post("/battle/manage", (req, res) => {
  res.json({ message: "Battle managed successfully!" });
});

export default router;
