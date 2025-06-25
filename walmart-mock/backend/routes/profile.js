// backend/routes/profile.js

const express = require("express");
const router = express.Router();

let userProfile = {}; // In-memory profile

// Save profile
router.post("/save", (req, res) => {
  const { name, cardNumber, address } = req.body;

  if (!name || !cardNumber || !address) {
    return res.status(400).json({ error: "All fields are required." });
  }

  userProfile = { name, cardNumber, address };
  res.json({ message: "✅ Profile saved successfully", profile: userProfile });
});

// Get profile
router.get("/get", (req, res) => {
  res.json(userProfile);
});

module.exports = router;
