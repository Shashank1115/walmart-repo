let products = [];  // All products from backend
let fuse = null;    // Will hold Fuse instance
const BACKEND_URL = "http://localhost:4000";

async function renderProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  try {
    const res = await fetch(`${BACKEND_URL}/api/products`);
    products = await res.json();

    fuse = new Fuse(products, {
      keys: ['name'],
      threshold: 0.4,
    });
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
  const input = document.getElementById("searchInput").value.trim();
  if (!input) {
    renderProductList(products);
    return;
  }
  const results = fuse.search(input);
  const matchedProducts = results.map(result => result.item);
  renderProductList(matchedProducts);
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
  if (!products || products.length === 0) return [];

  const items = [];
  const seen = new Set();

  products.forEach(({ name }) => {
    const regex = new RegExp(
      `(\\d+)?\\s*(kg|l|liters?|packs?|bottles?)?\\s*(?:of\\s*)?${name}|${name}\\s*(\\d+)\\s*(kg|l|liters?|packs?|bottles?)?`,
      "gi"
    );

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
  });

  return items;
}

function simulateOrderFromChat(productName, requestedQuantity = 1) {
  const chatLog = document.getElementById("chatLog");

  // Search using Fuse
  const results = fuse.search(productName);

  if (results.length === 0) {
    chatLog.innerHTML += `<p><strong>Bot:</strong> Sorry, we don’t have that product.</p>`;
    chatLog.scrollTop = chatLog.scrollHeight;
    return;
  }

  // 🧠 Check for multiple results for generic terms like "rice"
  const matchedNames = results.map(r => r.item.name.toLowerCase());
  const uniqueNames = [...new Set(matchedNames)];

  if (uniqueNames.length > 1) {
    // Show dropdown for multiple options
    const selectId = `select_${Date.now()}`;
    const options = results.map(r =>
      `<option value="${r.item._id}">${r.item.name} (₹${r.item.price})</option>`
    ).join("");

    chatLog.innerHTML += `
      <p><strong>Bot:</strong> Multiple products found for "<strong>${productName}</strong>". Please select one:</p>
      <div class="flex items-center gap-2 mt-1">
        <select id="${selectId}" class="border px-2 py-1 rounded w-full">${options}</select>
        <button onclick="confirmDropdownSelection('${selectId}', ${requestedQuantity})"
          class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
          Add to Cart
        </button>
      </div>
    `;
    chatLog.scrollTop = chatLog.scrollHeight;
    return;
  }

  // ✅ Only one good match, proceed to auto add
  const matched = results[0].item;
  const skuMatch = matched.name.match(/(\d+)\s*(kg|l|liter|bottle|pack)/i);
  const skuUnit = skuMatch ? parseInt(skuMatch[1]) : 1;
  const unitsToAdd = Math.ceil(requestedQuantity / skuUnit);

  addToCart(matched._id, unitsToAdd);
  chatLog.innerHTML += `<p><strong>Bot:</strong> Added ${unitsToAdd} x ${matched.name} (₹${matched.price} each) to your cart. Total: ₹${matched.price * unitsToAdd}.</p>`;
  chatLog.scrollTop = chatLog.scrollHeight;
}

function confirmDropdownSelection(selectId, quantity) {
  const select = document.getElementById(selectId);
  const selectedId = select.value;
  const item = products.find(p => p._id === selectedId);
  if (!item) return;

  const skuMatch = item.name.match(/(\d+)\s*(kg|l|liter|bottle|pack)/i);
  const skuUnit = skuMatch ? parseInt(skuMatch[1]) : 1;
  const unitsToAdd = Math.ceil(quantity / skuUnit);

  addToCart(item._id, unitsToAdd);

  const chatLog = document.getElementById("chatLog");
  chatLog.innerHTML += `<p><strong>Bot:</strong> Added ${unitsToAdd} x ${item.name} (₹${item.price} each) to your cart. Total: ₹${item.price * unitsToAdd}.</p>`;
  chatLog.scrollTop = chatLog.scrollHeight;
}

function queueProductSimulations(items) {
  const added = new Set();
  items.forEach((item, index) => {
    if (!added.has(item.name.toLowerCase())) {
      setTimeout(() => {
        simulateOrderFromChat(item.name, item.quantity);
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
      tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
      logger: m => console.log(m)
    }).then(({ data: { text } }) => {
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

  if (!currentMode) {
    chatLog.innerHTML += `<p><strong>Bot:</strong> Please select a mode first: 💡 General Query or 🛒 Shopping Mode.</p>`;
    return;
  }

  document.getElementById("chatInput").value = "";

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

    parseAddToCartFromReply(botReply);
  } catch (err) {
    console.error("Chat error:", err);
    chatLog.innerHTML += `<p><strong>Bot:</strong> Sorry, something went wrong.</p>`;
  }
}

function parseAddToCartFromReply(reply) {
  const addRegex = /Added\s+(\d+)\s+x\s+(.+?)\s+\(₹(\d+)/i;
  const match = reply.match(addRegex);

  if (match) {
    const quantity = parseInt(match[1]);
    const productName = match[2].trim().toLowerCase();

    const matched = products.find(p =>
      p.name.toLowerCase() === productName || p.name.toLowerCase().includes(productName)
    );

    if (matched) {
      addToCart(matched._id, quantity);
    } else {
      console.warn("⚠️ Product not found in local products list:", productName);
    }
  }
}

renderProducts();
