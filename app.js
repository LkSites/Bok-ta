const STORAGE_KEYS = {
  PRODUCTS: "bokata_products_v1",
  ORDERS: "bokata_orders_v1",
  CART: "bokata_cart_v1"
};

const WHATSAPP_NUMBER = "5511999999999";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";

const DEFAULT_PRODUCTS = [
  {
    id: "p-1",
    name: "Bokáta Clássico Artesanal",
    category: "Lanches",
    price: 32.90,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    description: "Pão brioche amanteigado, blend bovino 180g, queijo prato, maionese da casa e batata rústica."
  },
  {
    id: "p-2",
    name: "Picanha na Chapa Bokáta",
    category: "Pratos",
    price: 68.00,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    description: "Corte nobre fatiado na chapa com arroz soltinho, farofa amanteigada, vinagrete e mandioca."
  },
  {
    id: "p-3",
    name: "Porção Especial Bokáta",
    category: "Porções",
    price: 44.50,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
    description: "Batatas crocantes, iscas de frango empanadas, queijo coalho e molhos especiais da casa."
  },
  {
    id: "p-4",
    name: "Limonada Suíça Cremosa",
    category: "Bebidas",
    price: 14.00,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    description: "Limões frescos batidos com toque cremoso e gelo na medida certa."
  }
];

function formatBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function getProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      return [...DEFAULT_PRODUCTS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      return [...DEFAULT_PRODUCTS];
    }
    return parsed;
  } catch (err) {
    console.warn("Erro ao ler produtos do localStorage, restaurando padrão:", err);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    return [...DEFAULT_PRODUCTS];
  }
}

function getCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

function getOrders() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

let activeCategory = "Todos";
let searchQuery = "";

const productsGrid = document.getElementById("productsGrid");
const categoryFilters = document.getElementById("categoryFilters");
const searchMenuInput = document.getElementById("searchMenuInput");
const cartCount = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartTotalEl = document.getElementById("cartTotal");
const cartOverlay = document.getElementById("cartOverlay");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const checkoutForm = document.getElementById("checkoutForm");

function renderProducts() {
  if (!productsGrid) return;

  const products = getProducts();
  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "Todos" || p.category === activeCategory;
    const term = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !term ||
      String(p.name || "").toLowerCase().includes(term) ||
      String(p.description || "").toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    productsGrid.innerHTML = `<p style="color: var(--text-muted);">Nenhum item encontrado para a pesquisa atual.</p>`;
    return;
  }

  productsGrid.innerHTML = filtered
    .map((product) => {
      const safeImage = product.image && product.image.trim() ? product.image.trim() : FALLBACK_IMAGE;
      return `
        <article class="product-card">
          <div class="product-image-wrap">
            <img
              src="${safeImage}"
              alt="${product.name}"
              loading="lazy"
              onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
            />
            <span class="product-cat-badge">${product.category || "Pratos"}</span>
          </div>
          <div class="product-body">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-desc">${product.description || ""}</p>
            <div class="product-footer">
              <span class="product-price">${formatBRL(product.price)}</span>
              <button class="btn btn-primary btn-sm" onclick="addToCart('${product.id}')" type="button">
                Adicionar
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function addToCart(productId) {
  const products = getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image || FALLBACK_IMAGE,
      qty: 1
    });
  }

  saveCart(cart);
  renderCart();
  showToast(`"${product.name}" adicionado ao carrinho.`);
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.qty += delta;
  const updated = item.qty <= 0 ? cart.filter((i) => i.id !== productId) : cart;
  saveCart(updated);
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.qty * item.price, 0);

  if (cartCount) cartCount.textContent = totalQty;
  if (cartSubtotalEl) cartSubtotalEl.textContent = formatBRL(totalPrice);
  if (cartTotalEl) cartTotalEl.textContent = formatBRL(totalPrice);

  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p style="color: var(--text-muted);">O seu carrinho encontra-se vazio.</p>`;
    return;
  }

  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <img src="${item.image || FALLBACK_IMAGE}" alt="${item.name}" />
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>${formatBRL(item.price)} cada</span>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" type="button" onclick="changeQty('${item.id}', -1)">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" type="button" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `
    )
    .join("");
}

function openCart() {
  if (cartOverlay) cartOverlay.classList.remove("hidden");
}

function closeCart() {
  if (cartOverlay) cartOverlay.classList.add("hidden");
}

if (openCartBtn) openCartBtn.addEventListener("click", openCart);
if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
if (cartOverlay) {
  cartOverlay.addEventListener("click", (e) => {
    if (e.target === cartOverlay) closeCart();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});

if (searchMenuInput) {
  searchMenuInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });
}

if (categoryFilters) {
  categoryFilters.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    renderProducts();
  });
}

if (checkoutForm) {
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
      showToast("Adicione pelo menos um item ao carrinho.");
      return;
    }

    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();
    const notes = document.getElementById("orderNotes").value.trim();
    const total = cart.reduce((acc, item) => acc + item.qty * item.price, 0);

    const newOrder = {
      id: "PED-" + Date.now().toString().slice(-6),
      date: new Date().toLocaleString("pt-PT"),
      customerName,
      customerPhone,
      notes,
      items: cart,
      total,
      status: "Novo Pedido"
    };

    const orders = getOrders();
    orders.unshift(newOrder);
    saveOrders(orders);

    const itemsText = cart
      .map((i) => `• ${i.qty}x ${i.name} (${formatBRL(i.price * i.qty)})`)
      .join("%0A");

    const message =
      `*Novo Pedido - Bokáta Restaurante*%0A` +
      `Código: *${newOrder.id}*%0A` +
      `Cliente: ${encodeURIComponent(customerName)}%0A` +
      `Telefone: ${encodeURIComponent(customerPhone)}%0A%0A` +
      `*Itens:*%0A${itemsText}%0A%0A` +
      `*Total: ${encodeURIComponent(formatBRL(total))}*%0A` +
      (notes ? `Obs.: ${encodeURIComponent(notes)}` : "");

    saveCart([]);
    renderCart();
    checkoutForm.reset();
    closeCart();

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    showToast(`Pedido ${newOrder.id} registado com sucesso!`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCart();
});