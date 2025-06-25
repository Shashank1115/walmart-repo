// let products = []; // This is needed for search, cart, etc.
// const BACKEND_URL = "http://localhost:4000"; 
// function renderProductList(list) {
//   const productList = document.getElementById("productList");
//   productList.innerHTML = "";

//   list.forEach((product) => {
//     const card = document.createElement("div");
//     card.className = "bg-white p-4 rounded-lg shadow hover:shadow-xl transition";
//     card.innerHTML = `
//       <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-cover rounded mb-4" />
//       <h3 class="text-lg font-semibold">${product.name}</h3>
//       <p class="text-gray-600 mb-2">₹${product.price}</p>
//       <button onclick="addToCart('${product._id}')" class="bg-blue-600 text-white px-3 py-1 rounded">Add to Cart</button>
//     `;
//     productList.appendChild(card);
//   });
// }

// function searchProducts() {
//   const input = document.getElementById("searchInput").value.toLowerCase();
//   const filtered = products.filter((p) =>
//     p.name.toLowerCase().includes(input)
//   );
//   renderProductList(filtered);
// }


// function startVoiceInput() {
//   const recognition = new webkitSpeechRecognition();
//   recognition.lang = "en-US";
//   recognition.onresult = (e) => {
//     const voiceText = e.results[0][0].transcript;
//     console.log("🎙️ Voice input:", voiceText);

//     const items = parseShoppingList(voiceText);
//     if (items.length === 0) {
//       alert("No valid product recognized in voice input.");
//       return;
//     }

//     items.forEach((item, index) => {
//       setTimeout(() => {
//         simulateOrderFromChat(item.name, item.quantity);
//       }, index * 1500);
//     });
//   };

//   recognition.onerror = (e) => {
//     console.error("Voice recognition error:", e);
//     alert("Voice recognition failed. Try again.");
//   };

//   recognition.start();
// }


// let pendingItemsToAdd = [];

// async function sendChat() {
//   const userMsg = document.getElementById("chatInput").value.trim();
//   if (!userMsg) return;

//   const chatLog = document.getElementById("chatLog");
//   chatLog.innerHTML += `<p><strong>You:</strong> ${userMsg}</p>`;
//   chatLog.scrollTop = chatLog.scrollHeight;

//   const shoppingItems = parseShoppingList(userMsg);
//   if (shoppingItems.length > 0) {
//     queueProductSimulations(shoppingItems);
//   }

//   try {
//     const res = await fetch("http://localhost:4000/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message: userMsg }),
//     });

//     const data = await res.json();
//     const botReply = data.reply;

//     chatLog.innerHTML += `<p><strong>Bot:</strong> ${botReply.replace(/\n/g, "<br>")}</p>`;
//     chatLog.scrollTop = chatLog.scrollHeight;
//   } catch (err) {
//     console.error("Chat error:", err);
//     chatLog.innerHTML += `<p><strong>Bot:</strong> Sorry, something went wrong.</p>`;
//   }

//   document.getElementById("chatInput").value = "";
// }
// function simulateOrderFromChat(productName, requestedQuantity = 1) {
//   const searchBar = document.getElementById("searchInput");
//   searchBar.value = productName;

//   // Step 1: Search
//   setTimeout(() => {
//     searchProducts();
//   }, 200);

//   // Step 2: Find and add
//   setTimeout(() => {
//     const matches = [...document.querySelectorAll("#productList > div")]; // Updated selector
//     const keywords = productName.toLowerCase().split(/\s+/);

//     const target = matches.find(p => {
//       const title = p.querySelector("h3")?.textContent.toLowerCase();
//       return keywords.every(k => title?.includes(k));
//     });

//     if (target) {
//       const title = target.querySelector("h3").textContent;
//       const matched = products.find(p => p.name.toLowerCase() === title.toLowerCase());

//       if (matched) {
//         const skuMatch = matched.name.match(/(\d+)\s*(kg|l|liter|bottle|pack)/i);
//         const skuUnit = skuMatch ? parseInt(skuMatch[1]) : 1;
//         const unitsToAdd = Math.ceil(requestedQuantity / skuUnit);

//         console.log(`🛒 Adding ${unitsToAdd} of "${matched.name}" for requested ${requestedQuantity}`);
//         addToCart(matched.id, unitsToAdd);
//       }
//     } else {
//       console.warn(`❌ Product "${productName}" not found`);
//     }
//   }, 1000);
// }

// function addToCart(id, quantity = 1) {
//   const cart = JSON.parse(localStorage.getItem("cart") || "[]");
//   const item = products.find((p) => p._id === id); // Use _id now
//   if (!item) return;

//   const existingIndex = cart.findIndex((c) => c._id === id);

//   if (existingIndex !== -1) {
//     cart[existingIndex].quantity = (cart[existingIndex].quantity || 0) + quantity;
//   } else {
//     cart.push({ ...item, quantity });
//   }

//   localStorage.setItem("cart", JSON.stringify(cart));
//   alert(`✅ Added ${quantity} x ${item.name} to cart!`);
// }



// function showCart() {
//   const cart = JSON.parse(localStorage.getItem("cart") || "[]");
//   console.log("🛒 Cart:", cart);
// }

// function parseShoppingList(text) {
//   const productsList = [
//     "Basmati Rice",
//     "Amul Milk",
//     "Coca-Cola Bottle",
//     "India Gate Rice"
//   ];

//   const items = [];
//   const seen = new Set();

//   for (const name of productsList) {
//     const regex = new RegExp(`(\\d+)?\\s*(kg|l|liters?|packs?|bottles?)?\\s*(?:of\\s*)?${name}|${name}\\s*(\\d+)\\s*(kg|l|liters?|packs?|bottles?)?`, "gi");
//     let match;

//     while ((match = regex.exec(text)) !== null) {
//       const quantity = parseInt(match[1] || match[3]) || 1;
//       const unit = match[2] || match[4] || ""; // unit like kg/l
//       const key = name.toLowerCase();

//       if (!seen.has(key)) {
//         items.push({ name, quantity, unit });
//         seen.add(key);
//       }
//     }
//   }

//   return items;
// }


// function queueProductSimulations(items) {
//   const added = new Set();
//   items.forEach((item, index) => {
//     if (!added.has(item.name.toLowerCase())) {
//       setTimeout(() => {
//         simulateOrderFromChat(item.name, item.quantity, item.unit);
//       }, index * 1500);
//       added.add(item.name.toLowerCase());
//     }
//   });
// }


// function handleImageUpload(event) {
//   const file = event.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = function () {
//     const imageData = reader.result;
//     const imgPreview = document.getElementById("previewImage");
//     imgPreview.src = imageData;
//     imgPreview.style.display = "block";

//     Tesseract.recognize(imageData, 'eng', {
//       logger: m => console.log(m)
//     }).then(({ data: { text } }) => {
//       console.log("Extracted text:", text);

//       //  Use unified shopping parser
//       const items = parseShoppingList(text);

//       if (items.length === 0) {
//         alert("Couldn't extract any valid product items from the image.");
//         return;
//       }

//       items.forEach((item, index) => {
//         setTimeout(() => {
//           simulateOrderFromChat(item.name, item.quantity);
//         }, index * 1500);
//       });
//     });
//   };
//   reader.readAsDataURL(file);
// }


// // function extractItemsFromText(text) {
// //   const pattern = /(\d+)\s*(?:kg|l|liter|pack|bottle)?\s*([a-zA-Z\s\-]+)/gi;
// //   const items = [];
// //   let match;
// //   const seen = new Set();

// //   while ((match = pattern.exec(text)) !== null) {
// //     const quantity = parseInt(match[1]);
// //     const name = match[2].trim().replace(/\s+/g, " ");
// //     const key = name.toLowerCase();
// //     if (!seen.has(key)) {
// //       items.push({ name, quantity });
// //       seen.add(key);
// //     }
// //   }

// //   return items;
// // }
// function extractItemsFromText(text) {
//   const items = [];
//   const seen = new Set();

//   // Match both "3kg Basmati Rice" and "Basmati Rice 3kg"
//   const pattern = /(?:(\d+)\s*(kg|l|liter|pack|bottle)?\s*([a-zA-Z\s\-]+))|([a-zA-Z\s\-]+)\s*(\d+)\s*(kg|l|liter|pack|bottle)?/gi;

//   let match;
//   while ((match = pattern.exec(text)) !== null) {
//     let quantity = 1;
//     let name = "";

//     if (match[1] && match[3]) {
//       // Pattern: "3kg Basmati Rice"
//       quantity = parseInt(match[1]);
//       name = match[3].trim();
//     } else if (match[4] && match[5]) {
//       // Pattern: "Basmati Rice 3kg"
//       quantity = parseInt(match[5]);
//       name = match[4].trim();
//     }

//     const key = name.toLowerCase().replace(/\s+/g, " ");
//     if (key && !seen.has(key)) {
//       items.push({ name, quantity });
//       seen.add(key);
//     }
//   }

//   return items;
// }

// async function fetchProducts() {
//   try {
//     const response = await fetch('http://localhost:4000/api/products');
//     const products = await response.json();
//     renderProducts(products);
//   } catch (err) {
//     console.error("Failed to load products.", err);
//     document.getElementById('productList').innerHTML = `<p class="text-red-600">Failed to load products.</p>`;
//   }
// }
// async function renderProducts() {
//   const productList = document.getElementById("productList");
//   productList.innerHTML = "";

//   try {
//     const res = await fetch(`${BACKEND_URL}/api/products`);
//     const products = await res.json();

//     products.forEach((product) => {
//       const card = document.createElement("div");
//       card.className = "bg-white p-4 rounded-lg shadow hover:shadow-xl transition";

//       card.innerHTML = `
//         <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-cover rounded mb-4" />
//         <h3 class="text-lg font-semibold">${product.name}</h3>
//         <p class="text-gray-600 mb-2">₹${product.price}</p>
//         <button onclick="addToCart('${product._id}')" class="bg-blue-600 text-white px-3 py-1 rounded">Add to Cart</button>
//       `;

//       productList.appendChild(card);
//     });
//   } catch (err) {
//     console.error("Error loading products:", err);
//     productList.innerHTML = "<p class='text-red-600'>Failed to load products.</p>";
//   }
// }

// renderProducts();
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
      const matched = products.find(p => p.name.toLowerCase() === title.toLowerCase());

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

renderProducts();
