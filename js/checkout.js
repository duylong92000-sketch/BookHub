
const ORDER_KEY = "orders";
const LAST_ORDER_KEY = "lastOrderId";

// Đọc dữ liệu
function checkoutReadJSON(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? defaultValue : JSON.parse(value);
    } catch (error) {
        console.error("Lỗi đọc dữ liệu:", key, error);
        return defaultValue;
    }
}

// Lấy danh sách đơn hàng
function getOrders() {
    const orders = checkoutReadJSON(ORDER_KEY, []);
    return Array.isArray(orders) ? orders : [];
}

// Lưu đơn hàng
function saveOrders(orders) {
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

// Tạo mã đơn hàng
function generateOrderId() {
    const max = getOrders().reduce((largest, order) => {
        const match = String(order.orderId || "").match(/^DH(\d+)$/);
        return match ? Math.max(largest, Number(match[1])) : largest;
    }, 0);
    return "DH" + String(max + 1).padStart(3, "0");
}

// Lấy ngày hiện tại
function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Lấy thông tin khách hàng từ Account
function checkoutGetCustomer() {
    return window.BookHubCart?.getCurrentCustomer() || null;
}

// Hiển thị thông tin khách hàng
function renderCustomerInfo() {
    const customer = checkoutGetCustomer();
    if (!customer) {
        alert("Vui lòng đăng nhập để thanh toán.");
        window.location.href = "login.html";
        return false;
    }

    const fields = {
        checkoutFullName: customer.fullName || "",
        checkoutPhone: customer.phone || "",
        checkoutEmail: customer.email || ""
    };

    Object.entries(fields).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input) input.value = value;
    });

    const address = document.getElementById("accountAddressText");
    if (address) address.textContent = customer.address || "Tài khoản chưa có địa chỉ.";
    return true;
}

// Hiển thị đơn hàng cần thanh toán
function renderCheckoutSummary() {
    const cart = window.BookHubCart.getDetailedCart();
    if (cart.length === 0) {
        alert("Giỏ hàng đang trống hoặc sản phẩm không còn tồn tại.");
        window.location.href = "cart.html";
        return false;
    }

    const itemsEl = document.getElementById("checkoutItems");
    if (itemsEl) {
        itemsEl.innerHTML = "";

        cart.forEach(item => {
            const div = document.createElement("div");
            div.className = "checkout-item";

            const nameWrap = document.createElement("div");
            const name = document.createElement("strong");
            name.textContent = item.productName;

            const qty = document.createElement("small");
            qty.textContent = "SL: " + item.quantity;
            nameWrap.append(name, qty);

            const price = document.createElement("strong");
            price.textContent = window.BookHubCart.formatCurrency(item.subtotal);

            div.append(nameWrap, price);
            itemsEl.appendChild(div);
        });
    }

    const total = window.BookHubCart.formatCurrency(window.BookHubCart.getCartTotal());
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const totalEl = document.getElementById("checkoutTotal");

    if (subtotalEl) subtotalEl.textContent = total;
    if (totalEl) totalEl.textContent = total;
    return true;
}

// Hiện hoặc ẩn ô nhập địa chỉ mới
function updateAddressBox() {
    const selected = document.querySelector('input[name="shippingAddressType"]:checked');
    const box = document.getElementById("newAddressBox");
    if (box) box.classList.toggle("show", selected?.value === "new");
}

// Lấy địa chỉ giao hàng
function getShippingAddress() {
    const customer = checkoutGetCustomer();
    const choice = document.querySelector('input[name="shippingAddressType"]:checked');

    if (!choice) throw new Error("Vui lòng chọn địa chỉ nhận hàng.");

    // Sử dụng địa chỉ trong Account
    if (choice.value === "account") {
        const address = String(customer?.address || "").trim();
        if (!address) throw new Error("Tài khoản chưa có địa chỉ, vui lòng nhập địa chỉ mới.");
        return address;
    }

    // Nhập địa chỉ mới
    const ids = ["newReceiverName", "newReceiverPhone", "newProvince", "newDistrict", "newStreet"];
    const [name, phone, province, district, street] = ids.map(id => (document.getElementById(id)?.value || "").trim());

    if (![name, phone, province, district, street].every(Boolean)) {
        throw new Error("Vui lòng nhập đầy đủ địa chỉ giao hàng.");
    }

    if (!/^\d{9,11}$/.test(phone)) throw new Error("Số điện thoại không hợp lệ.");
    return `${name} - ${phone} - ${street}, ${district}, ${province}`;
}

// Hiển thị thông tin thanh toán
function updatePaymentDetail() {
    const selected = document.querySelector('input[name="paymentMethod"]:checked');
    const card = document.getElementById("cardPaymentDetail");
    const gift = document.getElementById("giftcardPaymentDetail");

    if (card) card.classList.toggle("show", ["visa", "mastercard"].includes(selected?.value));
    if (gift) gift.classList.toggle("show", selected?.value === "giftcard");
}

// Kiểm tra phương thức thanh toán
function validatePayment() {
    const selected = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selected) throw new Error("Vui lòng chọn phương thức thanh toán.");

    const method = selected.value;

    if (["visa", "mastercard"].includes(method)) {
        const number = document.getElementById("cardNumber")?.value.replace(/\s/g, "") || "";
        const holder = document.getElementById("cardHolder")?.value.trim() || "";
        const expiry = document.getElementById("cardExpiry")?.value.trim() || "";
        const cvv = document.getElementById("cardCVV")?.value.trim() || "";

        if (!/^\d{16}$/.test(number)) throw new Error("Số thẻ phải có 16 chữ số.");
        if (!holder) throw new Error("Vui lòng nhập tên chủ thẻ.");
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) throw new Error("Ngày hết hạn phải là MM/YY.");
        if (!/^\d{3,4}$/.test(cvv)) throw new Error("CVV không hợp lệ.");
    }

    if (method === "giftcard" && !document.getElementById("giftcardCode")?.value.trim()) {
        throw new Error("Vui lòng nhập mã Giftcard.");
    }

    return method;
}

// Hiển thị thông báo
function showCheckoutMessage(message, type = "error") {
    const el = document.getElementById("checkoutMessage");
    if (!el) return;

    el.textContent = message;
    el.className = "checkout-message " + (type === "success" ? "checkout-message-success" : "checkout-message-error");
}

// Đặt hàng
function placeOrder() {
    try {
        const customer = checkoutGetCustomer();
        if (!customer) throw new Error("Vui lòng đăng nhập trước khi đặt hàng.");
        if (!window.BookHubCart) throw new Error("Chưa tải cart.js.");

        const cart = window.BookHubCart.getCart();
        const items = window.BookHubCart.getDetailedCart();

        if (Object.keys(cart).length === 0 || items.length === 0) {
            throw new Error("Giỏ hàng đang trống.");
        }

        if (items.length !== Object.keys(cart).length) {
            throw new Error("Có sách không còn tồn tại. Vui lòng kiểm tra giỏ hàng.");
        }

        // Kiểm tra tồn kho
        for (const item of items) {
            if (item.status === "inactive" || item.stockQuantity <= 0 || item.quantity > item.stockQuantity) {
                throw new Error(`${item.productName} không đủ số lượng tồn kho.`);
            }
        }

        const shippingAddress = getShippingAddress();
        const paymentMethod = validatePayment();
        const totalAmount = window.BookHubCart.getCartTotal();

        // Tạo đơn hàng
        const newOrder = {
            orderId: generateOrderId(),
            customerId: customer.customerId,
            orderDate: getCurrentDate(),

            items: items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal
            })),

            totalAmount,
            shippingAddress,
            paymentMethod,
            orderStatus: "pending"
        };

        // Lưu đơn hàng và xóa giỏ hàng
        const orders = getOrders();
        orders.push(newOrder);
        saveOrders(orders);

        localStorage.setItem(LAST_ORDER_KEY, newOrder.orderId);
        window.BookHubCart.saveCart({});

        showCheckoutMessage("Đặt hàng thành công.", "success");
        window.location.href = "successorder.html";

    } catch (error) {
        showCheckoutMessage(error.message, "error");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// Định dạng thông tin thẻ
function setupCardFormatting() {
    const number = document.getElementById("cardNumber");

    if (number) {
        number.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
        });
    }

    const expiry = document.getElementById("cardExpiry");

    if (expiry) {
        expiry.addEventListener("input", function () {
            let v = this.value.replace(/\D/g, "").slice(0, 4);
            if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
            this.value = v;
        });
    }

    const cvv = document.getElementById("cardCVV");

    if (cvv) {
        cvv.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, 4);
        });
    }
}

// Khởi chạy trang thanh toán
document.addEventListener("DOMContentLoaded", function () {
    if (!document.body.classList.contains("checkout-page")) return;
    if (!renderCustomerInfo() || !renderCheckoutSummary()) return;

    updateAddressBox();
    updatePaymentDetail();

    document.querySelectorAll('input[name="shippingAddressType"]').forEach(input => {
        input.addEventListener("change", updateAddressBox);
    });

    document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
        input.addEventListener("change", updatePaymentDetail);
    });

    const btn = document.getElementById("placeOrderBtn");
    if (btn) btn.addEventListener("click", placeOrder);

    setupCardFormatting();
});
