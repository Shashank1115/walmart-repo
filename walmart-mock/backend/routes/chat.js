// backend/routes/chat.js

const express = require("express");
const router = express.Router();
//const mode = req.body.mode || "order"; // default to 'order' for backward compatibility

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Ensure you have this in your backend/server.js
// require("dotenv").config();

const productCatalog = [
  { name: "Coca-Cola Bottle", price: 20 },
  { name: "Amul Milk 1L", price: 50 },
  { name: "Basmati Rice 1kg", price: 80 },
  { name: "India Gate Rice 1kg", price: 90 },
  { name: "Samsung 32-inch LED TV", price: 15999 },
  { name: "LG 43-inch Smart LED TV", price: 27999 },
  { name: "Ziploc Sandwich Bags 100 ct", price: 189 },
  { name: "Rubbermaid Food Storage Set", price: 1299 },
  { name: "Pyrex Glass Measuring Cup", price: 749 },
  { name: "KitchenAid Classic Peeler", price: 399 },
  { name: "Farberware Knife Set", price: 2499 },
  { name: "Hamilton Beach Toaster", price: 1899 },
  { name: "Oster Blender 700W", price: 3199 },
  { name: "Crock-Pot Slow Cooker", price: 2599 },
  { name: "Instant Pot Duo 7-in-1", price: 6999 },
  { name: "Ninja Air Fryer 4qt", price: 8999 },
  { name: "GE LED Light Bulbs 60W", price: 599 },
  { name: "Energizer AA Batteries 20 ct", price: 899 },
  { name: "Duracell AAA Batteries 24 ct", price: 1099 },
  { name: "Scotch Magic Tape 3 Pack", price: 299 },
  { name: "BIC Ballpoint Pens 10 ct", price: 199 },
  { name: "Sharpie Permanent Markers 5 ct", price: 449 },
  { name: "Crayola Colored Pencils 24 ct", price: 399 },
  { name: "Elmer's Glue-All 225ml", price: 129 },
  { name: "Expo Dry Erase Markers 8 ct", price: 599 },
  { name: "Five Star Spiral Notebook", price: 279 },
  { name: "Post-it Notes 3x3 12 ct", price: 529 },
  { name: "Great Value Paper Towels 6 Rolls", price: 499 },
  { name: "Bounty Select-A-Size 8 Rolls", price: 999 },
  { name: "Charmin Ultra Soft 12 Rolls", price: 1099 },
  { name: "Scott Toilet Paper 18 Rolls", price: 1199 },
  { name: "Kleenex Facial Tissue 4 Pack", price: 379 },
  { name: "Great Value Facial Tissues 3 Pack", price: 289 },
  { name: "Equate Cough Syrup", price: 199 },
  { name: "Great Value Frozen Pizza", price: 349 },
  { name: "Great Value Shredded Cheese", price: 279 },
  { name: "Sam's Choice Angus Beef Patties", price: 649 },
  { name: "Great Value Orange Juice 1L", price: 189 },
  { name: "Great Value Frozen Mixed Veggies", price: 159 },
  { name: "Equate First Aid Kit", price: 599 },
  { name: "Ozark Trail Stainless Bottle", price: 799 },
  { name: "Hyper Tough Screwdriver Set", price: 999 },
  { name: "Great Value Butter 500g", price: 249 },
  { name: "Equate Sunscreen SPF 50", price: 349 },
  { name: "Equate Epsom Salt 1kg", price: 189 },
  { name: "Better Homes Comforter Set", price: 3999 },
  { name: "Mainstays Table Lamp", price: 799 },
  { name: "Great Value Greek Yogurt", price: 179 },
  { name: "Great Value Coffee Creamer", price: 149 },
  { name: "Equate Sleep Aid Tablets", price: 229 },
  { name: "Mainstays Shower Curtain", price: 499 },
  { name: "Great Value Honey 250g", price: 229 },
  { name: "Sam’s Choice Trail Mix", price: 389 },
  { name: "Equate Pregnancy Test Kit", price: 259 },
  { name: "Great Value Brown Sugar", price: 169 },
  { name: "Equate Vitamin D Tablets", price: 319 },
  { name: "Equate Hand Wash 500ml", price: 129 },
  { name: "Mainstays Non-Stick Fry Pan", price: 649 },
  { name: "Better Homes Bath Towel Set", price: 1299 }
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
- Never assume variants or suggest extra options.
- Only reply once per message.
- Be concise and accurate.
- Format your response like this:
  "Added 2 x Amul Milk 1L (₹50 each) to your cart. Total: ₹100."
- Assume quantities like "2kg basmati rice" mean 2 units of "Basmati Rice 1kg", if a close match exists in the catalog.
- If the requested item isn't in this list, respond: "Sorry, we don't have that product."
- If the requested item isn't in this list **but seems like a variation of an existing product** (e.g., "2kg basmati rice" → "Basmati Rice 1kg"), respond:
  "Sorry, we don't have that product. (Basmati Rice is only available in 1kg pack)"

📦 EXAMPLES:
- User: add 3 basmati rice  
  Bot: Added 3 x Basmati Rice 1kg (₹80 each) to your cart. Total: ₹240.

- User: add 1 amul  
  Bot: Added 1 x Amul Milk 1L (₹50 each) to your cart. Total: ₹50.

- User: add 1 gold milk  
  Bot: Sorry, we don't have that product.

- User: add 2kg basmati rice 
  Bot: Added 2 x Basmati Rice 1kg (₹80 each) to your cart. Total: ₹160.

🛍️ PRODUCT RECOMMENDATIONS:
After successfully adding items to cart, always suggest 2-3 related products from the catalog with this format:

"**You might also like:**
- **[Product Name] - ₹[Price]** - Search for '[product name]'?
- **[Product Name] - ₹[Price]** - Search for '[product name]'?
- **[Product Name] - ₹[Price]** - Search for '[product name]'?"

RECOMMENDATION LOGIC:
- For dairy products (milk, butter, cheese) → suggest other dairy items
- For rice/grains → suggest other grains or cooking essentials  
- For snacks → suggest other snacks or beverages
- For vegetables → suggest other fresh produce
- For cleaning products → suggest other household items
- Always pick products that complement the purchased item

COMPLETE EXAMPLE WITH RECOMMENDATIONS:
- User: add 2 amul milk
  Bot: Added 2 x Amul Milk 1L (₹50 each) to your cart. Total: ₹100.
  
  **You might also like:**
  - **Amul Butter 500g - ₹120** - Search for 'butter'?
  - **Britannia Bread 400g - ₹25** - Search for 'bread'?
  - **Tata Tea Gold 250g - ₹85** - Search for 'tea'?

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
