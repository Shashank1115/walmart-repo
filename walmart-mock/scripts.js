const products = [
  {
    id: 1,
    name: "Coca-Cola Bottle",
    price: 20,
    image: "https://via.placeholder.com/100"
  },
  {
    id: 2,
    name: "Amul Milk 1L",
    price: 50,
    image: "https://via.placeholder.com/100"
  },
  {
    id: 3,
    name: "Basmati Rice 1kg",
    price: 80,
    image: "https://via.placeholder.com/100"
  },
  {
    id: 4,
    name: "India Gate Rice 1kg",
    price: 90,
    image: "https://via.placeholder.com/100"
  }
];

function renderProducts(list) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  list.forEach((p) => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;
    productList.appendChild(div);
  });
}





function searchProducts() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(input)
  );
  renderProducts(filtered);
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


let pendingItemsToAdd = [];

async function sendChat() {
  const userMsg = document.getElementById("chatInput").value.trim();
  if (!userMsg) return;

  const chatLog = document.getElementById("chatLog");
  chatLog.innerHTML += `<p><strong>You:</strong> ${userMsg}</p>`;
  chatLog.scrollTop = chatLog.scrollHeight;

  const shoppingItems = parseShoppingList(userMsg);
  if (shoppingItems.length > 0) {
    queueProductSimulations(shoppingItems);
  }

  try {
    const res = await fetch("http://localhost:4000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg }),
    });

    const data = await res.json();
    const botReply = data.reply;

    chatLog.innerHTML += `<p><strong>Bot:</strong> ${botReply.replace(/\n/g, "<br>")}</p>`;
    chatLog.scrollTop = chatLog.scrollHeight;
  } catch (err) {
    console.error("Chat error:", err);
    chatLog.innerHTML += `<p><strong>Bot:</strong> Sorry, something went wrong.</p>`;
  }

  document.getElementById("chatInput").value = "";
}
function simulateOrderFromChat(productName, requestedQuantity = 1, requestedUnit = "") {
  const searchBar = document.getElementById("searchInput");
  searchBar.value = productName;

  setTimeout(() => {
    searchProducts();
  }, 200);

  setTimeout(() => {
    const matches = [...document.querySelectorAll(".product")];
    const keywords = productName.toLowerCase().split(/\s+/);

    const target = matches.find(p => {
      const title = p.querySelector("h3").textContent.toLowerCase();
      return keywords.every(k => title.includes(k));
    });

    if (target) {
      const title = target.querySelector("h3").textContent;
      const matched = products.find(p => p.name.toLowerCase() === title.toLowerCase());

      if (matched) {
        // Extract SKU unit from product title, e.g. "1kg"
        const skuMatch = matched.name.match(/(\d+)\s*(kg|l|liter|bottle|pack)/i);
        const skuUnit = skuMatch ? parseInt(skuMatch[1]) : 1;
        const skuType = skuMatch ? skuMatch[2] : "";

        // Only divide if units match (e.g., 3kg / 1kg = 3 units)
        let unitsToAdd = 1;
        if (requestedUnit && skuType && requestedUnit.toLowerCase().startsWith(skuType.toLowerCase().charAt(0))) {
          unitsToAdd = Math.ceil(requestedQuantity / skuUnit);
        } else {
          unitsToAdd = requestedQuantity; // fallback
        }

        console.log(`🛒 Adding ${unitsToAdd} units of "${matched.name}" for requested ${requestedQuantity} ${requestedUnit}`);
        addToCart(matched.id, unitsToAdd);
      }
    } else {
      console.warn(`❌ Product "${productName}" not found`);
    }
  }, 1000);
}


function addToCart(id, quantity = 1) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const item = products.find((p) => p.id === id);
  if (!item) return;

  const existingIndex = cart.findIndex((c) => c.id === id);

  if (existingIndex !== -1) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 0) + quantity;
  } else {
    cart.push({ ...item, quantity });  // ✅ set quantity directly
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
    "Basmati Rice",
    "Amul Milk",
    "Coca-Cola Bottle",
    "India Gate Rice"
  ];

  const items = [];
  const seen = new Set();

  for (const name of productsList) {
    const regex = new RegExp(`(\\d+)?\\s*(kg|l|liters?|packs?|bottles?)?\\s*(?:of\\s*)?${name}|${name}\\s*(\\d+)\\s*(kg|l|liters?|packs?|bottles?)?`, "gi");
    let match;

    while ((match = regex.exec(text)) !== null) {
      const quantity = parseInt(match[1] || match[3]) || 1;
      const unit = match[2] || match[4] || ""; // unit like kg/l
      const key = name.toLowerCase();

      if (!seen.has(key)) {
        items.push({ name, quantity, unit });
        seen.add(key);
      }
    }
  }

  return items;
}


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

      //  Use unified shopping parser
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


// function extractItemsFromText(text) {
//   const pattern = /(\d+)\s*(?:kg|l|liter|pack|bottle)?\s*([a-zA-Z\s\-]+)/gi;
//   const items = [];
//   let match;
//   const seen = new Set();

//   while ((match = pattern.exec(text)) !== null) {
//     const quantity = parseInt(match[1]);
//     const name = match[2].trim().replace(/\s+/g, " ");
//     const key = name.toLowerCase();
//     if (!seen.has(key)) {
//       items.push({ name, quantity });
//       seen.add(key);
//     }
//   }

//   return items;
// }
function extractItemsFromText(text) {
  const items = [];
  const seen = new Set();

  // Match both "3kg Basmati Rice" and "Basmati Rice 3kg"
  const pattern = /(?:(\d+)\s*(kg|l|liter|pack|bottle)?\s*([a-zA-Z\s\-]+))|([a-zA-Z\s\-]+)\s*(\d+)\s*(kg|l|liter|pack|bottle)?/gi;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    let quantity = 1;
    let name = "";

    if (match[1] && match[3]) {
      // Pattern: "3kg Basmati Rice"
      quantity = parseInt(match[1]);
      name = match[3].trim();
    } else if (match[4] && match[5]) {
      // Pattern: "Basmati Rice 3kg"
      quantity = parseInt(match[5]);
      name = match[4].trim();
    }

    const key = name.toLowerCase().replace(/\s+/g, " ");
    if (key && !seen.has(key)) {
      items.push({ name, quantity });
      seen.add(key);
    }
  }

  return items;
}


renderProducts(products);