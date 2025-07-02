let products = []; // Needed for search, cart, etc.
const BACKEND_URL = "http://localhost:4000";

async function renderProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  try {
    const res = await fetch(`${BACKEND_URL}/api/products`);
    products = await res.json();
    renderProductList(products);
  } catch (err) {
    console.error("Error loading products:", err);
    productList.innerHTML = "<p class='text-red-600'>Failed to load products.</p>";
  }
}

function renderProductList(list) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  list.forEach((product) => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-lg shadow hover:shadow-xl transition";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-cover rounded mb-4" />
      <h3 class="text-lg font-semibold">${product.name}</h3>
      <p class="text-gray-600 mb-2">₹${product.price}</p>
      <button onclick="addToCart('${product._id}')" class="bg-blue-600 text-white px-3 py-1 rounded">Add to Cart</button>
    `;
    productList.appendChild(card);
  });
}

function searchProducts() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(input)
  );
  renderProductList(filtered);
}

function addToCart(id, quantity = 1) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const item = products.find((p) => p._id === id);
  if (!item) return;

  const existingIndex = cart.findIndex((c) => c._id === id);

  if (existingIndex !== -1) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 0) + quantity;
  } else {
    cart.push({ ...item, quantity });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`✅ Added ${quantity} x ${item.name} to cart!`);
}

function showCart() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  console.log("🛒 Cart:", cart);
}

function parseShoppingList(text) {
  const productsList = [
    "Coca-Cola Bottle",
    "Amul Milk 1L",
    "Basmati Rice 1kg",
    "India Gate Rice 1kg",
    "Samsung 32-inch LED TV",
    "LG 43-inch Smart LED TV",
    "Ziploc Sandwich Bags 100 ct",
    "Rubbermaid Food Storage Set",
    "Pyrex Glass Measuring Cup",
    "KitchenAid Classic Peeler",
    "Farberware Knife Set",
    "Hamilton Beach Toaster",
    "Oster Blender 700W",
    "Crock-Pot Slow Cooker",
    "Instant Pot Duo 7-in-1",
    "Ninja Air Fryer 4qt",
    "GE LED Light Bulbs 60W",
    "Energizer AA Batteries 20 ct",
    "Duracell AAA Batteries 24 ct",
    "Scotch Magic Tape 3 Pack",
    "BIC Ballpoint Pens 10 ct",
    "Sharpie Permanent Markers 5 ct",
    "Crayola Colored Pencils 24 ct",
    "Elmer's Glue-All 225ml",
    "Expo Dry Erase Markers 8 ct",
    "Five Star Spiral Notebook",
    "Post-it Notes 3x3 12 ct",
    "Great Value Paper Towels 6 Rolls",
    "Bounty Select-A-Size 8 Rolls",
    "Charmin Ultra Soft 12 Rolls",
    "Scott Toilet Paper 18 Rolls",
    "Kleenex Facial Tissue 4 Pack",
    "Great Value Facial Tissues 3 Pack",
    "Equate Cough Syrup",
    "Great Value Frozen Pizza",
    "Great Value Shredded Cheese",
    "Sam's Choice Angus Beef Patties",
    "Great Value Orange Juice 1L",
    "Great Value Frozen Mixed Veggies",
    "Equate First Aid Kit",
    "Ozark Trail Stainless Bottle",
    "Hyper Tough Screwdriver Set",
    "Great Value Butter 500g",
    "Equate Sunscreen SPF 50",
    "Equate Epsom Salt 1kg",
    "Better Homes Comforter Set",
    "Mainstays Table Lamp",
    "Great Value Greek Yogurt",
    "Great Value Coffee Creamer",
    "Equate Sleep Aid Tablets",
    "Mainstays Shower Curtain",
    "Great Value Honey 250g",
    "Sam’s Choice Trail Mix",
    "Equate Pregnancy Test Kit",
    "Great Value Brown Sugar",
    "Equate Vitamin D Tablets",
    "Equate Hand Wash 500ml",
    "Mainstays Non-Stick Fry Pan",
    "Better Homes Bath Towel Set"
  ];

  const items = [];
  const seen = new Set();

  for (const name of productsList) {
    const regex = new RegExp(`(\\d+)?\\s*(kg|l|liters?|packs?|bottles?|ct|inch|ml|g)?\\s*(?:of\\s*)?${name}|${name}\\s*(\\d+)\\s*(kg|l|liters?|packs?|bottles?|ct|inch|ml|g)?`, "gi");
    let match;

    while ((match = regex.exec(text)) !== null) {
      const quantity = parseInt(match[1] || match[3]) || 1;
      const unit = match[2] || match[4] || "";
      const key = name.toLowerCase();

      if (!seen.has(key)) {
        items.push({ name, quantity, unit });
        seen.add(key);
      }
    }
  }

  return items;
}


function simulateOrderFromChat(productName, requestedQuantity = 1) {
  const searchBar = document.getElementById("searchInput");
  searchBar.value = productName;

  setTimeout(() => {
    searchProducts();
  }, 200);

  setTimeout(() => {
    const matches = [...document.querySelectorAll("#productList > div")];
    const keywords = productName.toLowerCase().split(/\s+/);

    const target = matches.find(p => {
      const title = p.querySelector("h3")?.textContent.toLowerCase();
      return keywords.every(k => title?.includes(k));
    });

    if (target) {
      const title = target.querySelector("h3").textContent;
      // const matched = products.find(p => p.name.toLowerCase() === title.toLowerCase());
      const matched = products.find(p =>
  p.name.toLowerCase().includes(productName.toLowerCase())
);


      if (matched) {
        const skuMatch = matched.name.match(/(\\d+)\\s*(kg|l|liter|bottle|pack)/i);
        const skuUnit = skuMatch ? parseInt(skuMatch[1]) : 1;
        const unitsToAdd = Math.ceil(requestedQuantity / skuUnit);

        console.log(`🛒 Adding ${unitsToAdd} of "${matched.name}" for requested ${requestedQuantity}`);
        addToCart(matched._id, unitsToAdd);
      }
    } else {
      console.warn(`❌ Product "${productName}" not found`);
    }
  }, 1000);
}

// This function takes an array of items and simulates the order of each item in the array
//This function takes an array of items and simulates a product simulation for each item in the array
function queueProductSimulations(items) {
  const added = new Set();
  items.forEach((item, index) => {
    if (!added.has(item.name.toLowerCase())) {
      setTimeout(() => {
        simulateOrderFromChat(item.name, item.quantity, item.unit);
      }, index * 1500);
      added.add(item.name.toLowerCase());
    }
  });
}

function startVoiceInput() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.onresult = (e) => {
    const voiceText = e.results[0][0].transcript;
    console.log("🎙️ Voice input:", voiceText);

    const items = parseShoppingList(voiceText);
    if (items.length === 0) {
      alert("No valid product recognized in voice input.");
      return;
    }

    items.forEach((item, index) => {
      setTimeout(() => {
        simulateOrderFromChat(item.name, item.quantity);
      }, index * 1500);
    });
  };

  recognition.onerror = (e) => {
    console.error("Voice recognition error:", e);
    alert("Voice recognition failed. Try again.");
  };

  recognition.start();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const imageData = reader.result;
    const imgPreview = document.getElementById("previewImage");
    imgPreview.src = imageData;
    imgPreview.style.display = "block";

    Tesseract.recognize(imageData, 'eng', {
      logger: m => console.log(m)
    }).then(({ data: { text } }) => {
      console.log("Extracted text:", text);

      const items = parseShoppingList(text);

      if (items.length === 0) {
        alert("Couldn't extract any valid product items from the image.");
        return;
      }

      items.forEach((item, index) => {
        setTimeout(() => {
          simulateOrderFromChat(item.name, item.quantity);
        }, index * 1500);
      });
    });
  };
  reader.readAsDataURL(file);
}
async function sendChat() {
  const userMsg = document.getElementById("chatInput").value.trim();
  if (!userMsg) return;

  const chatLog = document.getElementById("chatLog");
  chatLog.innerHTML += `<p><strong>You:</strong> ${userMsg}</p>`;
  chatLog.scrollTop = chatLog.scrollHeight;

  // 🧠 Don't proceed if mode not selected
  if (!currentMode) {
    chatLog.innerHTML += `<p><strong>Bot:</strong> Please select a mode first: 💡 General Query or 🛒 Shopping Mode.</p>`;
    return;
  }

  // Clear chat input regardless of mode
  document.getElementById("chatInput").value = "";

  // 🧾 Optional: parse items only in shopping mode
  if (currentMode === 'order') {
    const shoppingItems = parseShoppingList(userMsg);
    if (shoppingItems.length > 0) {
      queueProductSimulations(shoppingItems);
    }
  }

  // Determine endpoint
  const endpoint = currentMode === 'general'
    ? 'http://localhost:4000/general'
    : 'http://localhost:4000/chat';

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg }),
    });

    const data = await res.json();
    const botReply = data.reply || "Sorry, I didn't catch that.";

    chatLog.innerHTML += `<p><strong>Bot:</strong> ${botReply.replace(/\n/g, "<br>")}</p>`;
    chatLog.scrollTop = chatLog.scrollHeight;

  } catch (err) {
    console.error("Chat error:", err);
    chatLog.innerHTML += `<p><strong>Bot:</strong> Sorry, something went wrong.</p>`;
  }
}

async function handleImageCaptionSearch(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function () {
    const imageData = reader.result;
    const chatLog = document.getElementById("chatLog");

    try {
      chatLog.innerHTML += `<p><strong>Bot:</strong>  Uploading image...</p>`;

      // Step 1: Get caption from Flask server
      const res = await fetch("http://localhost:5000/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData })
      });

      if (!res.ok) throw new Error(`Flask server returned ${res.status}`);

      const data = await res.json();
      const caption = data.caption || "unknown object";
      chatLog.innerHTML += `<p><strong>Bot:</strong> Detected caption: "${caption}"</p>`;

      // Step 2: Use LLM to extract clean product name
      const llmRes = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `The image caption is: "${caption}". Your job is to match it to the closest product name in our grocery and electronics catalog. 
NEVER say "sorry", "no matching product", or "I don’t know". 
If unsure, reply with the closest match like "TV Screen", "Milk Bottle", or "Amul Milk". 
Your answer should ONLY be the product name and nothing else.`

        })
      });

      const llmData = await llmRes.json();
      let rawReply = llmData?.reply?.trim().toLowerCase() || "";

      // Step 3: Validate LLM reply
      if (
        !rawReply ||
        rawReply === "none" ||
        rawReply === "null" ||
        rawReply.includes("sorry") ||
        rawReply.includes("don’t have") ||
        rawReply.includes("do not have") ||
        rawReply.includes("not sure")
      ) {
        chatLog.innerHTML += `<p><strong>Bot:</strong>  I couldn't confidently detect a product. Try a different image.</p>`;
        return;
      }

      // Step 4: Clean product name
      const cleanedProduct = rawReply.replace(/[^a-zA-Z0-9\s]/g, "").trim();

      chatLog.innerHTML += `<p><strong>Bot:</strong> Searching for: "${cleanedProduct}"</p>`;
      searchProductsByText(cleanedProduct);

    } catch (err) {
      console.error("Image captioning error:", err);
      chatLog.innerHTML += `<p><strong>Bot:</strong>  Error: ${err.message}</p>`;
    }
  };

  reader.readAsDataURL(file);
}


function searchProductsByText(text) {
  if (!products || products.length === 0) return;

  const chatLog = document.getElementById("chatLog");

  // Fuzzy search using Fuse.js
  const fuse = new Fuse(products, {
    keys: ['name'],
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 2
  });

  const results = fuse.search(text);
  const matched = results.map(r => r.item);

  chatLog.innerHTML += `<p><strong>Bot:</strong> Detected product: "${text}"</p>`;

  if (matched.length > 0) {
    renderProductList(matched);
    chatLog.innerHTML += `<p><strong>Bot:</strong> Found ${matched.length} matching product(s).</p>`;
  } else {
    chatLog.innerHTML += `<p><strong>Bot:</strong> No matching product found for "${text}".</p>`;
  }

  chatLog.scrollTop = chatLog.scrollHeight;
}

let html5QrCode;

async function startBarcodeScanner() {
  document.getElementById("barcodeScannerModal").classList.remove("hidden");

  const scannerEl = document.getElementById("barcode-scanner");
  html5QrCode = new Html5Qrcode("barcode-scanner");

  try {
    await html5QrCode.start(
      { facingMode: "environment" }, // Rear camera
      {
        fps: 10,
        qrbox: { width: 250, height: 100 }
      },
      async (decodedText, decodedResult) => {
        console.log("✅ Barcode detected:", decodedText);
        stopBarcodeScanner();

        const chatLog = document.getElementById("chatLog");
        chatLog.innerHTML += `<p><strong>Bot:</strong> Scanned Barcode: "${decodedText}"</p>`;

        // Call backend with scanned barcode
        const res = await fetch(`http://localhost:4000/api/products/barcode/${decodedText}`);
        const data = await res.json();

        if (data && data.name) {
          chatLog.innerHTML += `<p><strong>Bot:</strong> Matched: ${data.name}</p>`;
          simulateOrderFromChat(data.name, 1); // auto-add to cart
        } else {
          chatLog.innerHTML += `<p><strong>Bot:</strong> No matching product found for barcode.</p>`;
        }
      },
      err => {
        // Ignore scan errors
      }
    );
  } catch (err) {
    console.error("Camera start error:", err);
    alert("Camera access failed.");
    closeBarcodeScanner();
  }
}

function stopBarcodeScanner() {
  if (html5QrCode) {
    html5QrCode.stop()
      .then(() => {
        html5QrCode.clear();
        html5QrCode = null; // 🧹 Clean up reference
        closeBarcodeScanner(); // Now hide modal
      })
      .catch(err => {
        console.error("❌ Failed to stop scanner:", err);
        closeBarcodeScanner(); // Still hide UI
      });
  } else {
    closeBarcodeScanner(); // fallback
  }
}


function closeBarcodeScanner() {
  document.getElementById("barcodeScannerModal").classList.add("hidden");
}


renderProducts();
