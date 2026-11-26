let allProducts = [];
let cart = {};

async function loadProducts() {
    const response = await fetch("/api/products");
    allProducts = await response.json();

    const category = document.getElementById("category").value;

    const filtered = category === "All"
        ? allProducts
        : allProducts.filter(p => p.category === category);

    document.getElementById("products").innerHTML = filtered.map(p => `
        <div class="product">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>Seller: ${p.seller}</p>
            <p>Price: ₹${p.price}</p>
            <p>Stock: ${p.stock}</p>
            <button onclick="addToCart(${p.id})"
                ${p.stock === 0 ? "disabled" : ""}>
                ${p.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
        </div>
    `).join("");
}

function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    const quantity = cart[id] || 0;

    if (quantity < product.stock) {
        cart[id] = quantity + 1;
    }

    renderCart();
}

function changeQuantity(id, change) {
    const product = allProducts.find(p => p.id === id);
    const newQuantity = (cart[id] || 0) + change;

    if (newQuantity <= 0) {
        delete cart[id];
    } else if (newQuantity <= product.stock) {
        cart[id] = newQuantity;
    }

    renderCart();
}

function renderCart() {
    let subtotal = 0;
    let sellers = {};

    Object.keys(cart).forEach(id => {
        const product = allProducts.find(p => p.id == id);
        const qty = cart[id];
        const amount = product.price * qty;

        subtotal += amount;

        if (!sellers[product.seller]) {
            sellers[product.seller] = [];
        }

        sellers[product.seller].push({
            name: product.name,
            qty,
            amount,
            id
        });
    });

    let html = "";

    for (const seller in sellers) {
        html += `<h3>${seller}</h3>`;

        sellers[seller].forEach(item => {
            html += `
                <p>
                    ${item.name} × ${item.qty}
                    = ₹${item.amount}
                    <button onclick="changeQuantity(${item.id}, -1)">−</button>
                    <button onclick="changeQuantity(${item.id}, 1)">+</button>
                </p>
            `;
        });
    }

    document.getElementById("cart").innerHTML =
        html || "Your cart is empty.";

    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    document.getElementById("summary").innerHTML = `
        <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
        <p>GST (18%): ₹${gst.toFixed(2)}</p>
        <h3>Final Total: ₹${total.toFixed(2)}</h3>
    `;
}

loadProducts();
renderCart();

function placeOrder() {
  const itemIds = Object.keys(cart);
  if (itemIds.length === 0) {
    alert("Your cart is empty! Please add products before placing an order.");
    return;
  }

  // Deduct ordered quantities from local stock and clear cart
  let subtotal = 0;
  itemIds.forEach(id => {
    const product = products.find(p => p.id == id);
    if (product) {
      subtotal += product.price * cart[id];
      product.stock -= cart[id];
    }
  });

  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

  // Clear the cart and re-render products & cart
  for (const id in cart) {
    delete cart[id];
  }
  renderProducts();
  renderCart();

  // Show confirmation banner
  const confirmationDiv = document.getElementById("order-confirmation");
  confirmationDiv.innerHTML = `
    <div style="background-color: #e8f5e9; border: 1px solid #2e7d32; color: #1b5e20; padding: 14px; border-radius: 6px;">
      <strong>Order Placed Successfully!</strong><br>
      Order ID: <b>${orderId}</b><br>
      Amount Paid (incl. 18% GST): <b>₹${total.toFixed(2)}</b><br>
      <small>Product stock has been updated accordingly.</small>
    </div>
  `;
}