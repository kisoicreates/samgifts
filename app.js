/**
 * ============================================================
 *  SamGifts — app.js
 *  Vanilla JavaScript — No frameworks
 *  Features: Cart (localStorage), Search, Category Filter,
 *            WhatsApp ordering, Toasts, Mobile nav
 * ============================================================
 */

/* ─── WhatsApp Number ───────────────────────────────────────
   WhatsApp number ( Example: 254712345678
   ─────────────────────────────────────────────────────────── */
const WHATSAPP_NUMBER = "254705707852";

/* ─── Cart State ────────────────────────────────────────────
   Cart is an array of objects: { id, name, price, qty }
   Loaded from and saved to localStorage automatically.
   ─────────────────────────────────────────────────────────── */
let cart = [];

/* ─── DOM References ─────────────────────────────────────── */
const cartBtn      = document.getElementById("cartBtn");
const cartClose    = document.getElementById("cartClose");
const cartSidebar  = document.getElementById("cartSidebar");
const cartOverlay  = document.getElementById("cartOverlay");
const cartItems    = document.getElementById("cartItems");
const cartFooter   = document.getElementById("cartFooter");
const cartEmpty    = document.getElementById("cartEmpty");
const cartCount    = document.getElementById("cartCount");
const cartTotal    = document.getElementById("cartTotal");
const hamburger    = document.getElementById("hamburger");
const mobileMenu   = document.getElementById("mobileMenu");
const searchInput  = document.getElementById("searchInput");
const mobileSearch = document.getElementById("mobileSearchInput");
const productsGrid = document.getElementById("productsGrid");
const noResults    = document.getElementById("noResults");
const filterBar    = document.getElementById("filterBar");
const activeFilter = document.getElementById("activeFilter");
const clearFilter  = document.getElementById("clearFilter");
const backToTop    = document.getElementById("backToTop");
const navbar       = document.getElementById("navbar");

/* ─── All product cards (live NodeList) ──────────────────── */
const allProducts = () => productsGrid.querySelectorAll(".product-card");

/* ─── Active category filter ─────────────────────────────── */
let activeCategory = "";

/* ===========================================================
   INITIALISE
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  renderCart();
  bindEvents();
});

/* ===========================================================
   EVENT BINDING
   =========================================================== */
function bindEvents() {

  // Cart open / close
  cartBtn.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // Hamburger toggle
  hamburger.addEventListener("click", toggleMobileMenu);

  // Close mobile menu on link click
  mobileMenu.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Desktop search
  searchInput.addEventListener("input", () => {
    syncSearch(searchInput.value);
  });

  // Mobile search — keep in sync with desktop
  mobileSearch.addEventListener("input", () => {
    searchInput.value = mobileSearch.value;
    syncSearch(mobileSearch.value);
  });

  // Category cards
  document.querySelectorAll(".cat-card").forEach(card => {
    card.addEventListener("click", () => filterByCategory(card.dataset.category));
    // Keyboard accessibility
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        filterByCategory(card.dataset.category);
      }
    });
  });

  // Clear filter button
  clearFilter.addEventListener("click", clearCategoryFilter);

  // Scroll events: navbar shadow + back-to-top
  window.addEventListener("scroll", onScroll);

  // Back to top
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ===========================================================
   NAVBAR SCROLL BEHAVIOUR
   =========================================================== */
function onScroll() {
  const y = window.scrollY;

  // Scrolled class for shadow
  navbar.classList.toggle("scrolled", y > 20);

  // Back to top visibility
  backToTop.classList.toggle("visible", y > 400);
}

/* ===========================================================
   MOBILE MENU
   =========================================================== */
function toggleMobileMenu() {
  const isOpen = mobileMenu.classList.toggle("open");
  hamburger.classList.toggle("active");
  hamburger.setAttribute("aria-expanded", isOpen);
  mobileMenu.setAttribute("aria-hidden", !isOpen);
  mobileMenu.style.display = "flex"; // make sure flex is set
}

function closeMobileMenu() {
  mobileMenu.classList.remove("open");
  hamburger.classList.remove("active");
  hamburger.setAttribute("aria-expanded", false);
  mobileMenu.setAttribute("aria-hidden", true);
}

/* ===========================================================
   SEARCH — filters product cards in real-time
   =========================================================== */
function syncSearch(query) {
  const q = query.trim().toLowerCase();
  let visibleCount = 0;

  // Reset category filter when user types
  if (q) {
    clearCategoryFilter(false); // silent — don't show/hide filterBar
  }

  allProducts().forEach(card => {
    const name     = card.dataset.name.toLowerCase();
    const category = card.dataset.category.toLowerCase();
    const matches  = name.includes(q) || category.includes(q);

    card.style.display = matches ? "" : "none";
    if (matches) visibleCount++;
  });

  noResults.style.display = visibleCount === 0 ? "flex" : "none";
}

/* ===========================================================
   CATEGORY FILTER
   =========================================================== */

/**
 * filterByCategory — shows only products matching the category
 * @param {string} cat — data-category value
 */
function filterByCategory(cat) {
  // Toggle off if same category clicked twice
  if (activeCategory === cat) {
    clearCategoryFilter();
    return;
  }

  activeCategory = cat;

  // Clear search
  searchInput.value = "";
  if (mobileSearch) mobileSearch.value = "";

  let visibleCount = 0;

  allProducts().forEach(card => {
    const matches = card.dataset.category === cat;
    card.style.display = matches ? "" : "none";
    if (matches) visibleCount++;
  });

  noResults.style.display = visibleCount === 0 ? "flex" : "none";

  // Highlight active category card
  document.querySelectorAll(".cat-card").forEach(c => {
    c.classList.toggle("active", c.dataset.category === cat);
  });

  // Show filter bar
  const labels = {
    birthday:   "Birthday Gifts",
    wedding:    "Wedding Gifts",
    valentine:  "Valentine Gifts",
    corporate:  "Corporate Gifts",
    baby:       "Baby Shower Gifts",
    graduation: "Graduation Gifts",
    christmas:  "Christmas Gifts",
    thankyou:   "Thank You Gifts",
    ladies:   "Ladies Gifts",
    men:   "Men Gifts",
    retirement:   "Retirement Gifts",
    anniversary:   "Anniversary Gifts",
  };

  activeFilter.textContent = labels[cat] || cat;
  filterBar.style.display = "flex";

  // Smooth scroll to products
  document.getElementById("products").scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * clearCategoryFilter — resets all product visibility
 * @param {boolean} showAll — whether to make all cards visible (default true)
 */
function clearCategoryFilter(showAll = true) {
  activeCategory = "";

  document.querySelectorAll(".cat-card").forEach(c => c.classList.remove("active"));

  filterBar.style.display = "none";

  if (showAll) {
    allProducts().forEach(card => (card.style.display = ""));
    noResults.style.display = "none";
  }
}

/* ===========================================================
   WHATSAPP ORDER (single product)
   Call this from each product's WhatsApp button via onclick
   =========================================================== */
/**
 * @param {string} productName — display name of the product
 * @param {number} price       — price as a number
 */
function orderOnWhatsApp(button) {
  const card = button.closest(".product-card");

  if (!card) {
    console.error("Product card not found.");
    return;
  }

  const productName =
    card.dataset.whatsappName ||
    card.dataset.name ||
    card.querySelector("h3")?.textContent.trim() ||
    "Unknown Product";

  const price = Number(
    String(card.dataset.price || "0").replace(/,/g, "")
  );

  const message =
    `Hello SamGifts, I would like to order:\n\n` +
    `*${productName}*\n` +
    `Price: KES ${price.toLocaleString()}\n\n` +
    `Please confirm availability and delivery details. Thank you!`;

  const url =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

/* ===========================================================
   CART — Add / Remove / Update
   =========================================================== */

/**
 * addToCart — reads product data from the card's article element
 * @param {HTMLElement} btn — the "Add to Cart" button clicked
 */
function addToCart(btn) {
  const card  = btn.closest(".product-card");
  const name  = card.dataset.whatsappName || card.querySelector("h3").textContent.trim();
  const price = parseInt(card.dataset.price, 10);
  const id    = name.toLowerCase().replace(/\s+/g, "-");

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty++;
    showToast(`<i class="fa-solid fa-circle-plus"></i> ${name} — qty updated`);
  } else {
    cart.push({ id, name, price, qty: 1 });
    showToast(`<i class="fa-solid fa-bag-shopping"></i> ${name} added to cart!`);
  }

  // Button feedback
  btn.classList.add("added");
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-check"></i> Added!`;
  setTimeout(() => {
    btn.classList.remove("added");
    btn.innerHTML = originalHTML;
  }, 1600);

  saveCart();
  renderCart();
}

/**
 * removeFromCart — removes item by id
 * @param {string} id
 */
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

/**
 * changeQty — increments or decrements an item's quantity
 * @param {string} id
 * @param {number} delta — +1 or -1
 */
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  renderCart();
}

/**
 * clearCart — empties the entire cart
 */
function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  showToast(`<i class="fa-solid fa-trash"></i> Cart cleared`);
}

/* ===========================================================
   CART — Render
   =========================================================== */
function renderCart() {
  // Update count badge
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCount.textContent = totalQty;
  cartCount.classList.toggle("visible", totalQty > 0);

  // Empty vs items
  if (cart.length === 0) {
    cartEmpty.style.display = "flex";
    cartFooter.style.display = "none";

    // Remove all item elements (keep cartEmpty)
    cartItems.querySelectorAll(".cart-item").forEach(el => el.remove());
    return;
  }

  cartEmpty.style.display = "none";
  cartFooter.style.display = "flex";

  // Remove old rendered items
  cartItems.querySelectorAll(".cart-item").forEach(el => el.remove());

  // Render each item
  cart.forEach(item => {
    const el = document.createElement("div");
    el.className = "cart-item";
    el.setAttribute("data-id", item.id);
    el.innerHTML = `
      <div style="flex:1">
        <div class="cart-item-name">${escapeHTML(item.name)}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
          <button class="remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
      <div class="cart-item-price">KES ${(item.price * item.qty).toLocaleString()}</div>
    `;
    cartItems.appendChild(el);
  });

  // Total
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  cartTotal.textContent = `KES ${total.toLocaleString()}`;
}

/* ===========================================================
   CART — LocalStorage
   =========================================================== */
function saveCart() {
  try {
    localStorage.setItem("samgifts_cart", JSON.stringify(cart));
  } catch (e) {
    console.warn("Could not save cart:", e);
  }
}

function loadCart() {
  try {
    const stored = localStorage.getItem("samgifts_cart");
    if (stored) cart = JSON.parse(stored);
  } catch (e) {
    cart = [];
  }
}

/* ===========================================================
   CART — Open / Close sidebar
   =========================================================== */
function openCart() {
  cartSidebar.classList.add("open");
  cartOverlay.classList.add("active");
  cartSidebar.setAttribute("aria-hidden", "false");
  cartOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartSidebar.classList.remove("open");
  cartOverlay.classList.remove("active");
  cartSidebar.setAttribute("aria-hidden", "true");
  cartOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ===========================================================
   CHECKOUT VIA WHATSAPP (full cart)
   =========================================================== */
function checkoutWhatsApp() {
  if (cart.length === 0) {
    showToast(`<i class="fa-solid fa-circle-exclamation"></i> Your cart is empty!`);
    return;
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const lines = cart
    .map(i => `• ${i.name} ×${i.qty} — KES ${(i.price * i.qty).toLocaleString()}`)
    .join("\n");

  const message =
    `Hello SamGifts, I'd like to place the following order:\n\n` +
    `${lines}\n\n` +
    `*Total: KES ${total.toLocaleString()}*\n\n` +
    `Please confirm availability and delivery. Thank you!`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* ===========================================================
   NEWSLETTER SUBSCRIBE
   =========================================================== */
function subscribeNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector("input[type='email']");
  const msg   = document.getElementById("newsletterMsg");

  if (!input.value) return;

  // Simulate subscription (replace with real backend call if needed)
  msg.textContent = "🎉 You're subscribed! Watch your inbox for exclusive deals.";
  msg.style.color = "#4caf50";
  input.value = "";

  setTimeout(() => (msg.textContent = ""), 5000);
}

/* s===========================================================
   TOAST NOTIFICATION
   =========================================================== */
let toastTimeout;

function showToast(html) {
  // Remove any existing toast first
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = html;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ===========================================================
   UTILITY
   =========================================================== */

/**
 * escapeHTML — prevents XSS when rendering user-sourced strings
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ===========================================================
   EXPOSE functions needed by inline onclick handlers in HTML
   (These are already global since this file runs in browser scope)

   Summary of global functions:
     addToCart(btn)                 — Add to Cart buttons
     removeFromCart(id)             — Remove button in cart
     changeQty(id, delta)           — +/- buttons in cart
     clearCart()                    — Clear Cart button
     orderOnWhatsApp(name, price)   — WhatsApp button per product
     checkoutWhatsApp()             — Checkout button in cart
     closeCart()                    — called from hero "Start Shopping"
     subscribeNewsletter(event)     — footer form onsubmit
   =========================================================== */
