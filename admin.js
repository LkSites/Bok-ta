const STORAGE_KEYS = {
  PRODUCTS: "bokata_products_v1",
  ORDERS: "bokata_orders_v1",
  AUTH: "bokata_admin_auth_v1"
};

const ADMIN_CREDENTIALS = {
  user: "admin",
  pass: "senha123"
};

const DEFAULT_PRODUCTS = [
  {
    id: "p-1",
    name: "Bokáta Clássico Artesanal",
    category: "Lanches",
    price: 32.90,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    description: "Pão brioche selado na manteiga, blend bovino 180g, queijo prato, maionese da casa e batata rústica."
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

const loginScreen = document.getElementById("loginScreen");
const adminDashboard = document.getElementById("adminDashboard");
const loginForm = document.getElementById("loginForm");
const adminUserInput = document.getElementById("adminUser");
const adminPassInput = document.getElementById("adminPass");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

function isAuthenticated() {
  return sessionStorage.getItem(STORAGE_KEYS.AUTH) === "true";
}

function setAuthenticated(status) {
  if (status) {
    sessionStorage.setItem(STORAGE_KEYS.AUTH, "true");
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
  }
}

function syncAuthView() {
  if (isAuthenticated()) {
    loginScreen.classList.add("hidden");
    adminDashboard.classList.remove("hidden");
    renderAll();
  } else {
    loginScreen.classList.remove("hidden");
    adminDashboard.classList.add("hidden");
  }
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = adminUserInput.value.trim();
  const pass = adminPassInput.value;

  if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
    loginError.classList.add("hidden");
    setAuthenticated(true);
    syncAuthView();
  } else {
    loginError.classList.remove("hidden");
  }
});

logoutBtn.addEventListener("click", () => {
  setAuthenticated(false);
  syncAuthView();
});

function formatBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function getProducts() {
  const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    return [...DEFAULT_PRODUCTS];
  }
  return JSON.parse(saved);
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

function getOrders() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

const productForm = document.getElementById("productForm");
const editingProductId = document.getElementById("editingProductId");
const prodName = document.getElementById("prodName");
const prodCategory = document.getElementById("prodCategory");
const prodPrice = document.getElementById("prodPrice");
const prodImage = document.getElementById("prodImage");
const prodDescription = document.getElementById("prodDescription");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const saveProductBtn = document.getElementById("saveProductBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const adminProductsBody = document.getElementById("adminProductsBody");
const orderHistoryList = document.getElementById("orderHistoryList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const resetDemoBtn = document.getElementById("resetDemoBtn");

function renderStats() {
  const products = getProducts();
  const orders = getOrders();
  const revenue = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);

  document.getElementById("statProducts").textContent = products.length;
  document.getElementById("statOrders").textContent = orders.length;
  document.getElementById("statRevenue").textContent = formatBRL(revenue);
}

function renderAdminProducts() {
  const products = getProducts();

  if (products.length === 0) {
    adminProductsBody.innerHTML = `<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>`;
    return;
  }

  adminProductsBody.innerHTML = products
    .map(
      (p) => `
      <tr>
        <td><img src="${p.image}" alt="${p.name}" class="thumb-img" /></td>
        <td>
          <strong>${p.name}</strong><br />
          <small style="color: var(--text-muted);">${p.description}</small>
        </td>
        <td>${p.category}</td>
        <td><strong>${formatBRL(p.price)}</strong></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-sm" type="button" onclick="startEditProduct('${p.id}')">
              Editar
            </button>
            <button class="btn btn-danger btn-sm" type="button" onclick="deleteProduct('${p.id}')">
              Excluir
            </button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function startEditProduct(id) {
  const products = getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return;

  editingProductId.value = product.id;
  prodName.value = product.name;
  prodCategory.value = product.category;
  prodPrice.value = product.price;
  prodImage.value = product.image;
  prodDescription.value = product.description;

  formTitle.textContent = `Editando: ${product.name}`;
  formSubtitle.textContent = "Altere os campos desejados e clique em Atualizar Produto";
  saveProductBtn.textContent = "Atualizar Produto";
  cancelEditBtn.classList.remove("hidden");
  productForm.scrollIntoView({ behavior: "smooth" });
}

function resetProductForm() {
  editingProductId.value = "";
  productForm.reset();
  formTitle.textContent = "Adicionar Novo Produto";
  formSubtitle.textContent = "Preencha os dados para exibir o item na loja do Bokáta";
  saveProductBtn.textContent = "Salvar Produto";
  cancelEditBtn.classList.add("hidden");
}

function deleteProduct(id) {
  if (!confirm("Deseja realmente excluir este produto do cardápio?")) return;
  const updated = getProducts().filter((p) => p.id !== id);
  saveProducts(updated);
  if (editingProductId.value === id) resetProductForm();
  renderAll();
}

productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    name: prodName.value.trim(),
    category: prodCategory.value,
    price: parseFloat(prodPrice.value),
    image: prodImage.value.trim(),
    description: prodDescription.value.trim()
  };

  const products = getProducts();

  if (editingProductId.value) {
    const idx = products.findIndex((p) => p.id === editingProductId.value);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...payload };
    }
  } else {
    products.unshift({
      id: "p-" + Date.now(),
      ...payload
    });
  }

  saveProducts(products);
  resetProductForm();
  renderAll();
});

cancelEditBtn.addEventListener("click", resetProductForm);

function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;
  order.status = newStatus;
  saveOrders(orders);
}

function renderOrderHistory() {
  const orders = getOrders();

  if (orders.length === 0) {
    orderHistoryList.innerHTML = `<p style="color: var(--text-muted);">Nenhuma compra registrada ainda. Faça um pedido na loja para testar.</p>`;
    return;
  }

  orderHistoryList.innerHTML = orders
    .map((order) => {
      const itemsSummary = (order.items || [])
        .map((i) => `${i.qty}x ${i.name} (${formatBRL(i.price * i.qty)})`)
        .join(", ");

      return `
        <div class="order-card">
          <div class="order-top">
            <div>
              <strong>${order.id}</strong> — <span>${order.customerName}</span> (${order.customerPhone})
            </div>
            <small style="color: var(--text-muted);">${order.date}</small>
          </div>
          <div class="order-items-list">
            <strong>Itens:</strong> ${itemsSummary}
            ${order.notes ? `<br /><strong>Obs.:</strong> ${order.notes}` : ""}
          </div>
          <div class="order-bottom">
            <strong>Total: ${formatBRL(order.total)}</strong>
            <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
              <option value="Novo Pedido" ${order.status === "Novo Pedido" ? "selected" : ""}>Novo Pedido</option>
              <option value="Em Preparo" ${order.status === "Em Preparo" ? "selected" : ""}>Em Preparo</option>
              <option value="Saiu para Entrega" ${order.status === "Saiu para Entrega" ? "selected" : ""}>Saiu para Entrega</option>
              <option value="Concluído" ${order.status === "Concluído" ? "selected" : ""}>Concluído</option>
            </select>
          </div>
        </div>
      `;
    })
    .join("");
}

clearHistoryBtn.addEventListener("click", () => {
  if (!confirm("Deseja apagar todo o histórico de compras?")) return;
  saveOrders([]);
  renderAll();
});

resetDemoBtn.addEventListener("click", () => {
  if (!confirm("Restaurar os produtos padrão do Bokáta Restaurante?")) return;
  saveProducts([...DEFAULT_PRODUCTS]);
  resetProductForm();
  renderAll();
});

function renderAll() {
  renderStats();
  renderAdminProducts();
  renderOrderHistory();
}

syncAuthView();