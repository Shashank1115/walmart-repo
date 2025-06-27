const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

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
You are a helpful assistant for the ShopSmart Pro application.

💡 Your job is to answer general questions about the app features.

You can explain:
- How to search and add items
- How voice and image upload works
- What the chatbot can do
- How cart and checkout work

🛑 DO NOT give shopping responses like "Added to cart". That belongs to Order Mode.
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
    console.error("General Mode API error:", err);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

module.exports = router;
