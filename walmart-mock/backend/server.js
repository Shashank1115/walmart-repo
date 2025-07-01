const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/shopsmart", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error", err));

// Route imports
const productRoutes = require("./routes/productroutes");
const chatRoutes = require("./routes/chat");
const profileRoutes = require("./routes/profile");




// Use the routes
app.use("/api/products", productRoutes);
app.use("/chat", chatRoutes);        // <-- POST /chat from scripts.js
app.use("/profile", profileRoutes);  // <-- POST /profile/save and GET /profile/get
app.use("/general", require("./routes/general"));
app.use('/api/products', require('./routes/productroutes'));

// Run server
const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
