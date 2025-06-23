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

// Render products
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

// Add to cart
function addToCart(id, quantity = 1) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const item = products.find((p) => p.id === id);

  for (let i = 0; i < quantity; i++) {
    cart.push(item);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`Added ${quantity} x ${item.name} to cart!`);
}


// Search
function searchProducts() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(input)
  );
  renderProducts(filtered);
}

// Voice input
function startVoiceInput() {
  const recognition = new webkitSpeechRecognition();
  recognition.onresult = (e) => {
    const query = e.results[0][0].transcript;
    document.getElementById("searchInput").value = query;
    searchProducts();
  };
  recognition.start();
}

// Placeholder chatbot logic
let pendingItemsToAdd = [];

async function sendChat() {
  const userMsg = document.getElementById("chatInput").value.trim();
  if (!userMsg) return;

  const chatLog = document.getElementById("chatLog");
  chatLog.innerHTML += `<p><strong>You:</strong> ${userMsg}</p>`;
  chatLog.scrollTop = chatLog.scrollHeight;

  // ✅ Directly parse user input for products
  const shoppingItems = parseShoppingList(`* ${userMsg.replace(/and/gi, '\n*')}`);
  if (shoppingItems.length > 0) {
    queueProductSimulations(shoppingItems);
  }

  // 🧠 Optional: still show bot response
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

function simulateOrderFromChat(productName, quantity = 1) {
  const searchBar = document.getElementById("searchInput");
  searchBar.value = productName;

  // Step 1: trigger search
  setTimeout(() => {
    searchProducts();  // update product list
  }, 200);

  // Step 2: safely add once
  setTimeout(() => {
    const matches = [...document.querySelectorAll(".product")];
    const keywords = productName.toLowerCase().split(/\s+/);

    const target = matches.find(p => {
      const title = p.querySelector("h3").textContent.toLowerCase();
      return keywords.every(k => title.includes(k));
    });

    if (target) {
      const title = target.querySelector("h3").textContent;

      const matched = products.find(p => {
        return p.name.toLowerCase() === title.toLowerCase();
      });

      if (matched) {
        // ✅ Add once with specified quantity
        addToCart(matched.id, quantity);
      }
    } else {
      console.warn(`❌ Product "${productName}" not found`);
    }
  }, 1000); // Give time for UI to reflect
}
function parseShoppingList(text) {
  const items = [];
  const seen = new Set();

  const lines = text.split('\n').filter(line =>
    line.trim().startsWith('*') && line.toLowerCase().includes(' ')
  );

  for (const line of lines) {
    const match = /\*\s*(\d+)\s*(kg|liter|litre|packets|packs)?\s*(.+)/i.exec(line);
    if (match) {
      const quantity = parseInt(match[1]);
      let name = match[3].trim().replace(/\(.*?\)/g, "").replace(/\.+$/, "").trim();
      name = name.replace(/s\b/i, "");

      const key = name.toLowerCase();
      if (!seen.has(key)) {
        items.push({ name, quantity });
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
        simulateOrderFromChat(item.name, item.quantity);
      }, index * 2000);
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

    // Optional: show image
    const imgPreview = document.getElementById("previewImage");
    imgPreview.src = imageData;
    imgPreview.style.display = "block";

    // OCR with Tesseract
    Tesseract.recognize(
      imageData,
      'eng',
      { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
      console.log("Extracted text:", text);
      document.getElementById("searchInput").value = text.trim();
      searchProducts(); // run existing search logic
    });
  };

  reader.readAsDataURL(file);
}


// Initialize
renderProducts(products);
