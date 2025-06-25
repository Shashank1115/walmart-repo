// backend/routes/chat.js

const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Ensure you have this in your backend/server.js
// require("dotenv").config();

const productCatalog = [
  { name: "Coca-Cola Bottle", price: 20 },
  { name: "Amul Milk 1L", price: 50 },
  { name: "Basmati Rice 1kg", price: 80 },
  { name: "India Gate Rice 1kg", price: 90 }
];

const catalogString = productCatalog.map(p => `${p.name} — ₹${p.price}`).join("\n");

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
You are a shopping assistant for ShopSmart Pro.

📌 PRODUCT CATALOG (use ONLY these, no other products or prices):
${catalogString}

🔒 RULES:
- Do NOT invent products, brands, variants (like Amul Gold, Slim, etc), or prices.
- If the requested item isn't in this list, respond: "Sorry, we don’t have that product."
- Never assume variants or suggest extra options.
- Only reply once per message.
- Be concise and accurate.
- Format your response like this:
  "Added 2 x Amul Milk 1L (₹50 each) to your cart. Total: ₹100."

📦 EXAMPLES:
- User: add 3 basmati rice  
  Bot: Added 3 x Basmati Rice 1kg (₹80 each) to your cart. Total: ₹240.

- User: add 1 amul  
  Bot: Added 1 x Amul Milk 1L (₹50 each) to your cart. Total: ₹50.

- User: add 1 gold milk  
  Bot: Sorry, we don’t have that product.

Keep it clean and only respond to what was asked.
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

    if (!data.choices || !data.choices[0]) {
      console.error("❌ Invalid response from Groq:", data);
      return res.status(500).json({ reply: "Sorry, Groq gave an invalid response." });
    }

    const reply = data.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error("❌ Groq API error:", err);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

module.exports = router;
