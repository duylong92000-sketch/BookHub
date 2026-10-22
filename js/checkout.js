
const ORDER_KEY = "orders";
const LAST_ORDER_KEY = "lastOrderId";

function checkoutReadJSON(key, defaultValue = []) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error(error);
        return defaultValue;
    }
}

function getOrders() {
    const orders = checkoutReadJSON(ORDER_KEY, []);
    return Array.isArray(orders) ? orders : [];
}

function saveOrders(orders) {
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

function generateOrderId() {
    const orders = getOrders();
    let maxNumber = 0;

    orders.forEach(order => {
        const match = String(order.orderId || "").match(/\d+/);
        if (match) maxNumber = Math.max(maxNumber, Number(match[0]));
    });

    const nextNumber = maxNumber + 1;
    return "DH" + String(nextNumber).padStart(3, "0");
}

function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function checkoutGetCustomer() {
    if (window.BookHubCart && window.BookHubCart.getCurrentCustomer) {
        return window.BookHubCart.getCurrentCustomer();
    }
    return null;
}

function renderCustomerInfo() {
    const customer = checkoutGetCustomer();
    if (!customer) {
        alert("Bạn cần đăng nhập để thanh toán.");
        window.location.href = "login.html";
        return false;
    }

    const fullName = document.getElementById("checkoutFullName");
    const phone = document.getElementById("checkoutPhone");
    const email = document.getElementById("checkoutEmail");
    const address = document.getElementById("accountAddressText");

    if (fullName) fullName.value = customer.fullName || "";
    if (phone) phone.value = customer.phone || "";
    if (email) email.value = customer.email || "";
    if (address) address.textContent = customer.address || "Tài khoản chưa có địa chỉ.";
    return true;
}

function renderCheckoutSummary() {
    if (!window.BookHubCart) return false;
    const cart = window.BookHubCart.getDetailedCart();

    if (cart.length === 0) {
        alert("Giỏ hàng đang trống.");
        window.location.href = "cart.html";
        return false;
    }

    const container = document.getElementById("checkoutItems");
    if (container) {
        container.innerHTML = cart.map(item => `
            <div class="checkout-item">
                <div>
                    <strong>${item.productName}</strong>
                    <small>SL: ${item.quantity}</small>
                </div>
                <strong>${window.BookHubCart.formatCurrency(item.subtotal)}</strong>
            </div>
        `).join("");
    }

    const total = window.BookHubCart.getCartTotal();
    const subtotal = document.getElementById("checkoutSubtotal");
    const totalElement = document.getElementById("checkoutTotal");

    if (subtotal) subtotal.textContent = window.BookHubCart.formatCurrency(total);
    if (totalElement) totalElement.textContent = window.BookHubCart.formatCurrency(total);
    return true;
}

function updateAddressBox() {
    const selected = document.querySelector('input[name="shippingAddressType"]:checked');
    const newAddressBox = document.getElementById("newAddressBox");
    if (!newAddressBox) return;

    if (selected && selected.value === "new") {
        newAddressBox.classList.add("show");
    } else {
        newAddressBox.classList.remove("show");
    }
}

function getShippingAddress() {
    const customer = checkoutGetCustomer();
    const type = document.querySelector('input[name="shippingAddressType"]:checked');
    if (!type) throw new Error("Vui lòng chọn địa chỉ nhận hàng.");

    if (type.value === "account") {
        if (!customer || !customer.address || !customer.address.trim()) {
            throw new Error("Tài khoản chưa có địa chỉ. Vui lòng nhập địa chỉ giao hàng mới.");
        }
        return customer.address.trim();
    }

    const receiverName = document.getElementById("newReceiverName").value.trim();
    const receiverPhone = document.getElementById("newReceiverPhone").value.trim();
    const province = document.getElementById("newProvince").value.trim();
    const district = document.getElementById("newDistrict").value.trim();
    const street = document.getElementById("newStreet").value.trim();

    if (!receiverName || !receiverPhone || !province || !district || !street) {
        throw new Error("Vui lòng nhập đầy đủ địa chỉ giao hàng mới.");
    }

    if (!/^[0-9]{9,11}$/.test(receiverPhone)) {
        throw new Error("Số điện thoại người nhận không hợp lệ.");
    }

    return `${receiverName} - ${receiverPhone} - ${street}, ${district}, ${province}`;
}

function updatePaymentDetail() {
    const payment = document.querySelector('input[name="paymentMethod"]:checked');
    const cardBox = document.getElementById("cardPaymentDetail");
    const giftBox = document.getElementById("giftcardPaymentDetail");

    if (cardBox) cardBox.classList.remove("show");
    if (giftBox) giftBox.classList.remove("show");
    if (!payment) return;

    if (payment.value === "visa" || payment.value === "mastercard") {
        cardBox.classList.add("show");
    }

    if (payment.value === "giftcard") {
        giftBox.classList.add("show");
    }
}

function validatePayment() {
    const payment = document.querySelector('input[name="paymentMethod"]:checked');
    if (!payment) throw new Error("Vui lòng chọn phương thức thanh toán.");
    const paymentMethod = payment.value;

    if (paymentMethod === "visa" || paymentMethod === "mastercard") {
        const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "");
        const cardHolder = document.getElementById("cardHolder").value.trim();
        const cardExpiry = document.getElementById("cardExpiry").value.trim();
        const cardCVV = document.getElementById("cardCVV").value.trim();

        if (!/^\d{16}$/.test(cardNumber)) throw new Error("Số thẻ phải gồm 16 chữ số.");
        if (!cardHolder) throw new Error("Vui lòng nhập tên chủ thẻ.");
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) throw new Error("Ngày hết hạn phải có dạng MM/YY.");
        if (!/^\d{3,4}$/.test(cardCVV)) throw new Error("CVV không hợp lệ.");
    }

    if (paymentMethod === "giftcard") {
        const code = document.getElementById("giftcardCode").value.trim();
        if (!code) throw new Error("Vui lòng nhập mã Giftcard.");
    }
    return paymentMethod;
}

function showCheckoutMessage(message, type = "error") {
    const element = document.getElementById("checkoutMessage");
    if (!element) return;

    element.textContent = message;
    element.className = "checkout-message";
    if (type === "success") {
        element.classList.add("checkout-message-success");
    } else {
        element.classList.add("checkout-message-error");
    }
}

function placeOrder() {
    try {
        const customer = checkoutGetCustomer();
        if (!customer) throw new Error("Bạn cần đăng nhập.");

        const detailedCart = window.BookHubCart.getDetailedCart();
        if (detailedCart.length === 0) throw new Error("Giỏ hàng đang trống.");

        for (const item of detailedCart) {
            if (item.stockQuantity > 0 && item.quantity > item.stockQuantity) {
                throw new Error(`${item.productName} không đủ số lượng tồn kho.`);
            }
        }

        const shippingAddress = getShippingAddress();
        const paymentMethod = validatePayment();
        const totalAmount = window.BookHubCart.getCartTotal();
        const orderItems = detailedCart.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal
        }));

        const newOrder = {
            orderId: generateOrderId(),
            customerId: customer.customerId,
            orderDate: getCurrentDate(),
            items: orderItems,
            totalAmount: totalAmount,
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod,
            orderStatus: "pending"
        };

        const orders = getOrders();
        orders.push(newOrder);
        saveOrders(orders);
        localStorage.setItem(LAST_ORDER_KEY, newOrder.orderId);
        localStorage.removeItem("cart");
        showCheckoutMessage("Đặt hàng thành công.", "success");
        window.location.href = "successorder.html";
    } catch (error) {
        showCheckoutMessage(error.message, "error");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

function setupCardFormatting() {
    const cardNumber = document.getElementById("cardNumber");
    if (cardNumber) {
        cardNumber.addEventListener("input", function () {
            let value = this.value.replace(/\D/g, "").slice(0, 16);
            this.value = value.replace(/(.{4})/g, "$1 ").trim();
        });
    }

    const expiry = document.getElementById("cardExpiry");
    if (expiry) {
        expiry.addEventListener("input", function () {
            let value = this.value.replace(/\D/g, "").slice(0, 4);
            if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2);
            this.value = value;
        });
    }

    const cvv = document.getElementById("cardCVV");
    if (cvv) {
        cvv.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, 4);
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (!document.body.classList.contains("checkout-page")) return;
    if (!renderCustomerInfo()) return;
    if (!renderCheckoutSummary()) return;

    updateAddressBox();
    updatePaymentDetail();

    document.querySelectorAll('input[name="shippingAddressType"]').forEach(input => {
        input.addEventListener("change", updateAddressBox);
    });

    document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
        input.addEventListener("change", updatePaymentDetail);
    });

    const placeOrderButton = document.getElementById("placeOrderBtn");
    if (placeOrderButton) placeOrderButton.addEventListener("click", placeOrder);
    setupCardFormatting();
});
