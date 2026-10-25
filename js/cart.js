
const CART_KEY = "cart";
const PRODUCT_KEY = "products";

function readJSON(key, defaultValue = []) {
    try {
        const value = localStorage.getItem(key);
        if (!value) return defaultValue;
        return JSON.parse(value);
    } catch (error) {
        console.error("Không thể đọc localStorage:", key, error);
        return defaultValue;
    }
}

function getCurrentCustomer() {
    const possibleKeys = ["currentCustomer", "currentUser", "loggedInCustomer", "loggedInUser"];

    for (const key of possibleKeys) {
        const customer = readJSON(key, null);
        if (customer && customer.customerID) return customer;
    }
    return null;
}

function getProducts() {
    const products = readJSON(PRODUCT_KEY, []);
    return Array.isArray(products) ? products : [];
}

function getCart() {
    const cart = readJSON(CART_KEY, []);
    return Array.isArray(cart) ? cart : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function findProduct(productId) {
    return getProducts().find(product => product.productId === productId);
}

function requireCustomerLogin() {
    const customer = getCurrentCustomer();
    if (customer) return customer;
    alert("Bạn cần đăng nhập để sử dụng giỏ hàng.");
    return null;
}

function addToCart(productId, quantity = 1) {
    if (!requireCustomerLogin()) return false;

    const product = findProduct(productId);
    if (!product) {
        alert("Không tìm thấy sản phẩm.");
        return false;
    }

    if (product.status === "inactive") {
        alert("Sản phẩm hiện không được bán.");
        return false;
    }

    const stockQuantity = Number(product.stockQuantity || 0);
    if (stockQuantity <= 0) {
        alert("Sản phẩm đã hết hàng.");
        return false;
    }

    quantity = Math.max(1, Number(quantity) || 1);
    let cart = getCart();
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        const newQuantity = Number(existingItem.quantity) + quantity;
        if (newQuantity > stockQuantity) {
            alert("Số lượng vượt quá tồn kho.");
            return false;
        }
        existingItem.quantity = newQuantity;
    } else {
        if (quantity > stockQuantity) {
            alert("Số lượng vượt quá tồn kho.");
            return false;
        }
        cart.push({ productId: productId, quantity: quantity });
    }

    saveCart(cart);
    alert("Đã thêm sản phẩm vào giỏ hàng.");
    return true;
}

function updateCartQuantity(productId, quantity) {
    let cart = getCart();
    const item = cart.find(cartItem => cartItem.productId === productId);
    if (!item) return;

    quantity = Number(quantity);
    if (quantity <= 0) {
        removeCartItem(productId);
        return;
    }

    const product = findProduct(productId);
    if (product) {
        const stock = Number(product.stockQuantity || 0);
        if (stock > 0 && quantity > stock) {
            alert(`Sản phẩm chỉ còn ${stock} sản phẩm.`);
            quantity = stock;
        }
    }

    item.quantity = quantity;
    saveCart(cart);
    renderCartPage();
}

function changeCartQuantity(productId, amount) {
    const cart = getCart();
    const item = cart.find(cartItem => cartItem.productId === productId);
    if (!item) return;
    updateCartQuantity(productId, Number(item.quantity) + Number(amount));
}

function removeCartItem(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.productId !== productId);
    saveCart(cart);
    renderCartPage();
}

function clearCart() {
    const cart = getCart();
    if (cart.length === 0) return;

    const confirmDelete = confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?");
    if (!confirmDelete) return;

    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCartPage();
}

function getDetailedCart() {
    const cart = getCart();
    const products = getProducts();

    return cart.map(item => {
        const product = products.find(p => p.productId === item.productId);
        if (!product) return null;

        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(product.salePrice || 0);

        return {
            productId: product.productId,
            productName: product.productName,
            image: product.image || "",
            quantity: quantity,
            unitPrice: unitPrice,
            subtotal: quantity * unitPrice,
            stockQuantity: Number(product.stockQuantity || 0)
        };
    }).filter(Boolean);
}

function getCartTotal() {
    return getDetailedCart().reduce((total, item) => total + Number(item.subtotal), 0);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
    document.querySelectorAll("#cartCount, .cart-count").forEach(element => {
        element.textContent = count;
    });
}

function getProductImagePath(image) {
    if (!image) return "../images/book-placeholder.jpg";
    if (image.startsWith("http") || image.startsWith("../") || image.startsWith("/")) return image;
    return "../images/" + image;
}

function renderCartPage() {
    const tableBody = document.getElementById("cartTableBody");
    if (!tableBody) return;

    const emptyCart = document.getElementById("emptyCart");
    const cartContent = document.getElementById("cartContent");
    const detailedCart = getDetailedCart();

    if (detailedCart.length === 0) {
        tableBody.innerHTML = "";
        if (emptyCart) emptyCart.hidden = false;
        if (cartContent) cartContent.hidden = true;
        updateCartCount();
        return;
    }

    if (emptyCart) emptyCart.hidden = true;
    if (cartContent) cartContent.hidden = false;

    tableBody.innerHTML = detailedCart.map(item => {
        return `
            <tr>
                <td>
                    <div class="cart-product">
                        <img src="${getProductImagePath(item.image)}"
                             alt="${item.productName}"
                             class="cart-product-image">
                        <div>
                            <div class="cart-product-name">${item.productName}</div>
                            <div class="cart-product-code">${item.productId}</div>
                        </div>
                    </div>
                </td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td>
                    <div class="cart-quantity">
                        <button type="button" onclick="changeCartQuantity('${item.productId}', -1)">−</button>
                        <input type="number" min="1" value="${item.quantity}"
                               onchange="updateCartQuantity('${item.productId}', this.value)">
                        <button type="button" onclick="changeCartQuantity('${item.productId}', 1)">+</button>
                    </div>
                </td>
                <td><strong>${formatCurrency(item.subtotal)}</strong></td>
                <td>
                    <button type="button" class="cart-remove-btn"
                            onclick="removeCartItem('${item.productId}')">Xóa</button>
                </td>
            </tr>
        `;
    }).join("");

    const total = getCartTotal();
    const subtotalElement = document.getElementById("cartSubtotal");
    const totalElement = document.getElementById("cartTotal");

    if (subtotalElement) subtotalElement.textContent = formatCurrency(total);
    if (totalElement) totalElement.textContent = formatCurrency(total);
    updateCartCount();
}

document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    renderCartPage();

    const clearButton = document.getElementById("clearCartBtn");
    if (clearButton) clearButton.addEventListener("click", clearCart);

    const checkoutButton = document.getElementById("checkoutBtn");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", function (event) {
            if (!getCurrentCustomer()) {
                event.preventDefault();
                alert("Bạn cần đăng nhập trước khi đặt hàng.");
                window.location.href = "login.html";
                return;
            }

            if (getCart().length === 0) {
                event.preventDefault();
                alert("Giỏ hàng đang trống.");
            }
        });
    }
});

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
