import express from "express";
const router = express.Router();

// Example login route
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Just a demo response (replace with real logic)
  if (username === "admin" && password === "1234") {
    return res.json({ success: true, message: "Login successful 🎉" });
  } else {
    return res.status(401).json({ success: false, message: "Invalid credentials ❌" });
  }
});

// Example register route
router.post("/register", (req, res) => {
  const { username, password } = req.body;
  return res.json({ success: true, message: `User ${username} registered ✅` });
});

export default router;
