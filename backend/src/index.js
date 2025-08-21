import express from "express";
import cors from "cors";
import auth from "./routes/auth.js";   // auth route import

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", auth);

// Default route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
