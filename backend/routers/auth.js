import express from "express";
const router = express.Router();

// Example register route
router.post("/register", (req, res) => {
  res.json({ message: "User registered successfully!" });
});

// Example login route
router.post("/login", (req, res) => {
  res.json({ message: "User logged in successfully!" });
});

export default router;
