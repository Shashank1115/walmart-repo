const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Product = require("../models/product");
const Fuse = require("fuse.js");

router.post("/", async (req, res) => {
  const userMessage = req.body.message || "";

  try {
    const dbProducts = await Product.find({}, "name price").lean();

    if (!dbProducts || dbProducts.length === 0) {
      return res.status(500).json({ reply: "Product catalog is empty. Please check your database." });
    }

    const lowerMsg = userMessage.toLowerCase();
    const quantityMatch = lowerMsg.match(/(\d+)\s*x?\s*/);
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
    const productQuery = userMessage.replace(/(\d+)\s*x?\s*/i, "").trim().toLowerCase();

    // Step 1: Exact match
    const exactMatch = dbProducts.find(p => p.name.toLowerCase() === productQuery);
    if (exactMatch) {
      return res.json({
        reply: `Added ${quantity} x ${exactMatch.name} (₹${exactMatch.price} each) to your cart. Total: ₹${exactMatch.price * quantity}.`
      });
    }

    // Step 2: Partial match
    const partialMatches = dbProducts.filter(p =>
      p.name.toLowerCase().includes(productQuery)
    );

    if (partialMatches.length === 1) {
      const product = partialMatches[0];
      return res.json({
        reply: `Added ${quantity} x ${product.name} (₹${product.price} each) to your cart. Total: ₹${product.price * quantity}.`
      });
    }

    // Step 3: Fuzzy search
    const fuse = new Fuse(dbProducts, {
      keys: ['name'],
      threshold: 0.4,
    });
    const fuzzyResults = fuse.search(productQuery);
    const topMatches = fuzzyResults.map(m => m.item);

    if (topMatches.length === 1) {
      const product = topMatches[0];
      return res.json({
        reply: `Added ${quantity} x ${product.name} (₹${product.price} each) to your cart. Total: ₹${product.price * quantity}.`
      });
    }

    if (topMatches.length > 1) {
      const suggestionList = topMatches.slice(0, 5).map(p => `• ${p.name} – ₹${p.price}`).join("\n");
      return res.json({
        reply: `I found multiple matching products for "${productQuery}":\n\n${suggestionList}\n\nPlease specify which one you'd like to add.`
      });
    }

    // Step 4: No match – fallback to LLM
    const catalogString = dbProducts.map(p => `${p.name} — ₹${p.price}`).join("\n");

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
- Do NOT invent products, brands, variants, or prices.
- Never assume variants or suggest extras.
- Only reply once per message.
- Format: "Added 2 x Basmati Rice 1kg (₹80 each) to your cart. Total: ₹160."
- If a variation is close but unavailable, say:
  "Sorry, we don’t have that product. (Basmati Rice is only available in 1kg pack)"

📦 EXAMPLES:
- User: add 3 basmati rice  
  Bot: Added 3 x Basmati Rice 1kg (₹80 each) to your cart. Total: ₹240.

- User: add 1 gold milk  
  Bot: Sorry, we don’t have that product.
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
      return res.status(500).json({ reply: "Sorry, Groq gave an invalid response." });
    }

    const reply = data.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error("❌ Groq API error:", err);
    res.status(500).json({ reply: "Sorry, something went wrong on the server." });
  }
});

module.exports = router;
