
const CART_KEY = "cart";
const PRODUCT_KEY = "products";

// Đọc dữ liệu localStorage
function readJSON(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? defaultValue : JSON.parse(value);
    } catch (error) {
        console.error("Lỗi đọc localStorage:", key, error);
        return defaultValue;
    }
}

// Lấy tài khoản đang đăng nhập
function getCurrentCustomer() {
    const user = readJSON("currentUser", null);
    return user && user.customerId ? user : null;
}

// Lấy danh sách sản phẩm
function getProducts() {
    const products = readJSON(PRODUCT_KEY, []);
    return Array.isArray(products) ? products : [];
}

// Chuyển dữ liệu giỏ hàng về dạng object
function normalizeCart(value) {
    const result = {};

    if (Array.isArray(value)) {
        value.forEach(item => {
            if (!item || typeof item.productId !== "string") return;
            const qty = Number(item.quantity);
            if (Number.isSafeInteger(qty) && qty > 0) result[item.productId] = qty;
        });
    } else if (value && typeof value === "object") {
        Object.entries(value).forEach(([id, quantity]) => {
            const qty = Number(quantity);
            if (Number.isSafeInteger(qty) && qty > 0) result[id] = qty;
        });
    }
    return result;
}

// Lấy giỏ hàng cùng định dạng với products.js
function getCart() {
    const raw = readJSON(CART_KEY, {});
    const cart = normalizeCart(raw);
    if (Array.isArray(raw)) localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
}

// Lưu giỏ hàng
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(normalizeCart(cart)));
    updateCartCount();
}

// Định dạng tiền
function formatCurrency(value) {
    return Number(value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

// Tránh chèn HTML khi hiển thị dữ liệu
function escapeHTML(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

// Tìm sản phẩm
function findProduct(productId) {
    return getProducts().find(product => product.productId === productId);
}

// Thêm sản phẩm vào giỏ hàng
function addToCart(productId, quantity = 1) {
    const product = findProduct(productId);
    const qty = Number(quantity);
    if (!product || product.status === "inactive" || !Number.isSafeInteger(qty) || qty <= 0) return false;

    const cart = getCart();
    const stock = Number(product.stockQuantity || 0);
    if (stock <= 0 || (cart[productId] || 0) + qty > stock) {
        alert("Số lượng mua vượt quá tồn kho.");
        return false;
    }

    cart[productId] = (cart[productId] || 0) + qty;
    saveCart(cart);
    return true;
}

// Cập nhật số lượng
function updateCartQuantity(productId, quantity) {
    const cart = getCart();
    if (!Object.prototype.hasOwnProperty.call(cart, productId)) return;

    const qty = Number(quantity);
    if (!Number.isSafeInteger(qty)) {
        renderCartPage();
        return;
    }
    if (qty <= 0) {
        removeCartItem(productId);
        return;
    }

    const product = findProduct(productId);
    if (!product || product.status === "inactive") {
        alert("Sản phẩm không còn được bán.");
        renderCartPage();
        return;
    }

    const stock = Number(product.stockQuantity || 0);
    if (stock <= 0) {
        alert("Sản phẩm đã hết hàng.");
        renderCartPage();
        return;
    }
    if (qty > stock) alert(`Sản phẩm chỉ còn ${stock} cuốn.`);

    cart[productId] = Math.min(qty, stock);
    saveCart(cart);
    renderCartPage();
}

// Tăng hoặc giảm số lượng
function changeCartQuantity(productId, amount) {
    const cart = getCart();
    if (!Object.prototype.hasOwnProperty.call(cart, productId)) return;
    updateCartQuantity(productId, cart[productId] + amount);
}

// Xóa một sản phẩm
function removeCartItem(productId) {
    const cart = getCart();
    delete cart[productId];
    saveCart(cart);
    renderCartPage();
}

// Xóa toàn bộ giỏ hàng
function clearCart() {
    if (Object.keys(getCart()).length === 0) return;
    if (!confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;
    saveCart({});
    renderCartPage();
}

// Lấy chi tiết sản phẩm trong giỏ hàng
function getDetailedCart() {
    const products = getProducts();
    return Object.entries(getCart()).map(([id, quantity]) => {
        const product = products.find(p => p.productId === id);
        if (!product) return null;
        const price = Number(product.salePrice || 0);
        return {
            productId: id,
            productName: product.productName || id,
            image: product.image || "",
            quantity,
            unitPrice: price,
            subtotal: price * quantity,
            stockQuantity: Number(product.stockQuantity || 0),
            status: product.status || "active"
        };
    }).filter(Boolean);
}

// Tính tổng tiền
function getCartTotal() {
    return getDetailedCart().reduce((sum, item) => sum + item.subtotal, 0);
}

// Cập nhật số lượng trên biểu tượng giỏ hàng
function updateCartCount() {
    const count = Object.values(getCart()).reduce((sum, qty) => sum + qty, 0);
    document.querySelectorAll("#cartCount, .cart-count").forEach(el => {
        el.textContent = count;
    });
}

// Lấy đường dẫn ảnh sản phẩm
function getProductImagePath(image) {
    if (!image) return "../images/book-placeholder.jpg";
    if (/^https?:\/\//i.test(image) || image.startsWith("/") || image.startsWith("../")) return image;
    if (image.startsWith("images/")) return "../" + image;
    return "../images/books/" + image;
}

// Hiển thị giỏ hàng
function renderCartPage() {
    const tbody = document.getElementById("cartTableBody");
    if (!tbody) return;

    const items = getDetailedCart();
    const empty = document.getElementById("emptyCart");
    const content = document.getElementById("cartContent");
    if (empty) empty.hidden = items.length > 0;
    if (content) content.hidden = items.length === 0;

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>
                <div class="cart-product">
                    <img class="cart-product-image" src="${escapeHTML(getProductImagePath(item.image))}" alt="${escapeHTML(item.productName)}">
                    <div>
                        <div class="cart-product-name">${escapeHTML(item.productName)}</div>
                        <div class="cart-product-code">${escapeHTML(item.productId)}</div>
                    </div>
                </div>
            </td>
            <td>${formatCurrency(item.unitPrice)}</td>
            <td>
                <div class="cart-quantity">
                    <button type="button" data-action="decrease" data-id="${escapeHTML(item.productId)}">−</button>
                    <input type="number" min="1" value="${item.quantity}" data-action="quantity" data-id="${escapeHTML(item.productId)}">
                    <button type="button" data-action="increase" data-id="${escapeHTML(item.productId)}">+</button>
                </div>
            </td>
            <td><strong>${formatCurrency(item.subtotal)}</strong></td>
            <td>
                <button type="button" class="cart-remove-btn" data-action="remove" data-id="${escapeHTML(item.productId)}">Xóa</button>
            </td>
        </tr>
    `).join("");

    const total = formatCurrency(getCartTotal());
    const subtotalEl = document.getElementById("cartSubtotal");
    const totalEl = document.getElementById("cartTotal");
    if (subtotalEl) subtotalEl.textContent = total;
    if (totalEl) totalEl.textContent = total;
    updateCartCount();
}

// Khởi chạy các chức năng
document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    renderCartPage();

    const tbody = document.getElementById("cartTableBody");
    if (tbody) {
        tbody.addEventListener("click", event => {
            const button = event.target.closest("button[data-action]");
            if (!button) return;
            const id = button.dataset.id;
            if (button.dataset.action === "increase") changeCartQuantity(id, 1);
            if (button.dataset.action === "decrease") changeCartQuantity(id, -1);
            if (button.dataset.action === "remove") removeCartItem(id);
        });

        tbody.addEventListener("change", event => {
            if (event.target.dataset.action === "quantity") {
                updateCartQuantity(event.target.dataset.id, event.target.value);
            }
        });
    }

    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) clearBtn.addEventListener("click", clearCart);

    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", event => {
            if (!getCurrentCustomer()) {
                event.preventDefault();
                alert("Vui lòng đăng nhập trước khi đặt hàng.");
                window.location.href = "login.html";
            } else if (getDetailedCart().length === 0) {
                event.preventDefault();
                alert("Giỏ hàng đang trống.");
            }
        });
    }
});

// Cho checkout.js sử dụng
window.BookHubCart = {
    getCart,
    saveCart,
    getProducts,
    getDetailedCart,
    getCartTotal,
    getCurrentCustomer,
    formatCurrency,
    updateCartCount,
    addToCart
};

window.addToCart = addToCart;