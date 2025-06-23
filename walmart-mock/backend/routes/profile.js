const express = require("express");
const router = express.Router();

let userProfile = {}; // simple in-memory (for demo)

router.post("/save", (req, res) => {
  const { name, cardNumber, address } = req.body;
  userProfile = { name, cardNumber, address };
  res.json({ message: "Profile saved successfully" });
});

router.get("/get", (req, res) => {
  res.json(userProfile);
});

module.exports = router;
