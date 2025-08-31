const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Simple routes
app.get("/", (req, res) => res.send("Hydra Backend Running"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/wallets", require("./routes/walletRoutes"));
app.use("/api/tx", require("./routes/txRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
