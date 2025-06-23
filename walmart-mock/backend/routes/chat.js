const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Your actual product catalog
const productCatalog = [
  { name: "Coca-Cola Bottle", price: 20 },
  { name: "Amul Milk 1L", price: 50 },
  { name: "Basmati Rice 1kg", price: 80 },
  { name: "India Gate Rice 1kg", price: 90 }
];

// Convert catalog to string
const catalogString = productCatalog.map(p => `${p.name} - ₹${p.price}`).join('\n');

router.post("/", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: `
You are a helpful shopping assistant for ShopSmart Pro.

Use ONLY the product list provided below when confirming prices or adding to the cart. Do NOT make up any prices or products.

Product List:
[
  { "name": "Coca-Cola Bottle", "price": 20 },
  { "name": "Amul Milk 1L", "price": 50 },
  { "name": "Basmati Rice 1kg", "price": 80 },
  { "name": "India Gate Rice 1kg", "price": 90 }
]

Instructions:
- If user says: "Add 2 Coca-Cola Bottles", reply: "Added 2 Coca-Cola Bottles (₹20 each) to your cart. Total: ₹40"
- If user asks for unavailable items, politely say it's not available.
- Do not duplicate replies or repeat messages.
- Only respond once.
`
},
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await groqRes.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

module.exports = router;
