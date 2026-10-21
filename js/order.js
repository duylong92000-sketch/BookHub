
/* =========================================================
   BOOKHUB - FILE: js/order.js
========================================================= */

const ORDERS_STORAGE_KEY = "orders";

function orderReadJSON(key, defaultValue = []) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error(error);
        return defaultValue;
    }
}

function orderGetOrders() {
    const orders = orderReadJSON(ORDERS_STORAGE_KEY, []);
    return Array.isArray(orders) ? orders : [];
}

function orderSaveOrders(orders) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function orderFormatCurrency(value) {
    return Number(value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function orderFormatDate(date) {
    if (!date) return "---";
    const parts = date.split("-");
    if (parts.length !== 3) return date;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function orderGetCurrentCustomer() {
    const keys = ["currentCustomer", "currentUser", "loggedInCustomer", "loggedInUser"];
    for (const key of keys) {
        const customer = orderReadJSON(key, null);
        if (customer && customer.customerId) return customer;
    }
    return null;
}

function getStatusText(status) {
    const statusMap = {
        pending: "Mới đặt",
        processing: "Đã xử lý",
        delivered: "Đã giao",
        cancelled: "Đã hủy"
    };
    return statusMap[status] || status;
}

function getPaymentText(payment) {
    const paymentMap = {
        cash: "Tiền mặt",
        visa: "Visa",
        mastercard: "Mastercard",
        giftcard: "Giftcard"
    };
    return paymentMap[payment] || payment;
}

function getStatusClass(status) {
    return "order-status " + "order-status-" + status;
}

/* =========================================================
   SUCCESSORDER.HTML
========================================================= */

function renderSuccessOrder() {
    if (!document.body.classList.contains("success-order-page")) return;

    const lastOrderId = localStorage.getItem("lastOrderId");
    const orders = orderGetOrders();
    const order = orders.find(item => item.orderId === lastOrderId);

    if (!order) {
        const box = document.querySelector(".success-order-box");
        if (box) {
            box.innerHTML = `
                <h1>Không tìm thấy đơn hàng</h1>
                <p>Không có thông tin đơn hàng gần nhất.</p>
                <a href="orders.html" class="action-btn action-btn-primary">Xem đơn hàng</a>
            `;
        }
        return;
    }

    document.getElementById("successOrderId").textContent = order.orderId;
    document.getElementById("successOrderDate").textContent = orderFormatDate(order.orderDate);
    document.getElementById("successAddress").textContent = order.shippingAddress;
    document.getElementById("successPayment").textContent = getPaymentText(order.paymentMethod);
    document.getElementById("successTotal").textContent = orderFormatCurrency(order.totalAmount);

    const itemContainer = document.getElementById("successOrderItems");
    itemContainer.innerHTML = order.items.map(item => `
        <div class="success-product-row">
            <div>
                <strong>${item.productName}</strong>
                <span>SL: ${item.quantity}</span>
            </div>
            <strong>${orderFormatCurrency(item.subtotal)}</strong>
        </div>
    `).join("");
}

/* =========================================================
   CUSTOMER ORDERS.HTML
========================================================= */

function renderCustomerOrders() {
    if (!document.body.classList.contains("customer-orders-page")) return;

    const customer = orderGetCurrentCustomer();
    if (!customer) {
        alert("Bạn cần đăng nhập để xem đơn hàng.");
        window.location.href = "login.html";
        return;
    }

    const allOrders = orderGetOrders();
    const customerOrders = allOrders
        .filter(order => order.customerId === customer.customerId)
        .sort((a, b) => String(b.orderDate).localeCompare(String(a.orderDate)));

    const container = document.getElementById("customerOrderList");
    const empty = document.getElementById("emptyOrders");

    if (customerOrders.length === 0) {
        container.innerHTML = "";
        empty.hidden = false;
        return;
    }

    empty.hidden = true;
    container.innerHTML = customerOrders.map(order => {
        const itemHTML = order.items.map(item => `
            <div class="customer-order-product">
                <div>
                    <strong>${item.productName}</strong>
                    <span>${item.quantity} × ${orderFormatCurrency(item.unitPrice)}</span>
                </div>
                <strong>${orderFormatCurrency(item.subtotal)}</strong>
            </div>
        `).join("");

        return `
            <article class="customer-order-card">
                <div class="customer-order-head">
                    <div>
                        <div class="customer-order-id">${order.orderId}</div>
                        <div class="customer-order-date">Ngày đặt: ${orderFormatDate(order.orderDate)}</div>
                    </div>
                    <span class="${getStatusClass(order.orderStatus)}">${getStatusText(order.orderStatus)}</span>
                </div>
                <div class="customer-order-products">${itemHTML}</div>
                <div class="customer-order-footer">
                    <button type="button" class="action-btn action-btn-secondary"
                            onclick="openCustomerOrderDetail('${order.orderId}')">Xem chi tiết</button>
                    <div class="customer-order-total">
                        Tổng tiền: <strong>${orderFormatCurrency(order.totalAmount)}</strong>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function openCustomerOrderDetail(orderId) {
    const order = orderGetOrders().find(item => item.orderId === orderId);
    if (!order) return;

    const container = document.getElementById("customerOrderDetail");
    const modal = document.getElementById("customerOrderModal");
    container.innerHTML = `
        <div class="order-detail-grid">
            <div><span>Mã đơn hàng</span><strong>${order.orderId}</strong></div>
            <div><span>Ngày đặt</span><strong>${orderFormatDate(order.orderDate)}</strong></div>
            <div><span>Thanh toán</span><strong>${getPaymentText(order.paymentMethod)}</strong></div>
            <div><span>Trạng thái</span><strong>${getStatusText(order.orderStatus)}</strong></div>
        </div>
        <div class="order-detail-address">
            <strong>Địa chỉ nhận hàng</strong>
            <p>${order.shippingAddress}</p>
        </div>
        <h3>Sản phẩm</h3>
        <div class="order-detail-products">
            ${order.items.map(item => `
                <div class="order-detail-product">
                    <span>${item.productName} × ${item.quantity}</span>
                    <strong>${orderFormatCurrency(item.subtotal)}</strong>
                </div>
            `).join("")}
        </div>
        <div class="order-detail-total">
            <span>Tổng cộng</span>
            <strong>${orderFormatCurrency(order.totalAmount)}</strong>
        </div>
    `;
    modal.classList.add("show");
}

/* =========================================================
   ADMIN ORDERS.HTML
========================================================= */

function getAdminFilteredOrders() {
    let orders = orderGetOrders();
    const keyword = document.getElementById("adminOrderSearch")?.value.trim().toLowerCase() || "";
    const dateFrom = document.getElementById("adminDateFrom")?.value || "";
    const dateTo = document.getElementById("adminDateTo")?.value || "";
    const status = document.getElementById("adminStatusFilter")?.value || "";

    if (keyword) {
        orders = orders.filter(order =>
            String(order.orderId).toLowerCase().includes(keyword) ||
            String(order.customerId).toLowerCase().includes(keyword)
        );
    }
    if (dateFrom) orders = orders.filter(order => order.orderDate >= dateFrom);
    if (dateTo) orders = orders.filter(order => order.orderDate <= dateTo);
    if (status) orders = orders.filter(order => order.orderStatus === status);

    return orders.sort((a, b) => {
        const dateCompare = String(b.orderDate).localeCompare(String(a.orderDate));
        if (dateCompare !== 0) return dateCompare;
        return String(b.orderId).localeCompare(String(a.orderId));
    });
}

function renderAdminOrders() {
    if (!document.body.classList.contains("admin-orders-page")) return;

    const orders = getAdminFilteredOrders();
    const tbody = document.getElementById("adminOrderTableBody");
    const empty = document.getElementById("adminEmptyOrders");
    const count = document.getElementById("adminOrderCount");

    if (count) count.textContent = `${orders.length} đơn hàng`;
    if (orders.length === 0) {
        tbody.innerHTML = "";
        if (empty) empty.hidden = false;
        return;
    }

    if (empty) empty.hidden = true;
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong class="admin-order-code">${order.orderId}</strong></td>
            <td>${order.customerId}</td>
            <td>${orderFormatDate(order.orderDate)}</td>
            <td><strong>${orderFormatCurrency(order.totalAmount)}</strong></td>
            <td>${getPaymentText(order.paymentMethod)}</td>
            <td>
                <select class="admin-order-status-select"
                        onchange="updateAdminOrderStatus('${order.orderId}', this.value)">
                    <option value="pending" ${order.orderStatus === "pending" ? "selected" : ""}>Mới đặt</option>
                    <option value="processing" ${order.orderStatus === "processing" ? "selected" : ""}>Đã xử lý</option>
                    <option value="delivered" ${order.orderStatus === "delivered" ? "selected" : ""}>Đã giao</option>
                    <option value="cancelled" ${order.orderStatus === "cancelled" ? "selected" : ""}>Đã hủy</option>
                </select>
            </td>
            <td>
                <button type="button" class="btn btn-primary btn-small"
                        onclick="openAdminOrderDetail('${order.orderId}')">Chi tiết</button>
            </td>
        </tr>
    `).join("");
}

function updateAdminOrderStatus(orderId, newStatus) {
    const allowedStatus = ["pending", "processing", "delivered", "cancelled"];
    if (!allowedStatus.includes(newStatus)) return;

    const orders = orderGetOrders();
    const order = orders.find(item => item.orderId === orderId);
    if (!order) return;

    const oldStatus = order.orderStatus;
    if (oldStatus === newStatus) return;

    const confirmed = confirm(`Cập nhật đơn ${orderId} từ "${getStatusText(oldStatus)}" sang "${getStatusText(newStatus)}"?`);
    if (!confirmed) {
        renderAdminOrders();
        return;
    }

    order.orderStatus = newStatus;
    orderSaveOrders(orders);
    renderAdminOrders();
}

function openAdminOrderDetail(orderId) {
    const order = orderGetOrders().find(item => item.orderId === orderId);
    if (!order) return;

    const container = document.getElementById("adminOrderDetail");
    const modal = document.getElementById("adminOrderModal");
    container.innerHTML = `
        <div class="admin-order-detail-grid">
            <div><span>Mã đơn hàng</span><strong>${order.orderId}</strong></div>
            <div><span>Mã khách hàng</span><strong>${order.customerId}</strong></div>
            <div><span>Ngày đặt</span><strong>${orderFormatDate(order.orderDate)}</strong></div>
            <div><span>Thanh toán</span><strong>${getPaymentText(order.paymentMethod)}</strong></div>
            <div><span>Trạng thái</span><strong>${getStatusText(order.orderStatus)}</strong></div>
        </div>
        <div class="admin-order-address">
            <h3>Địa chỉ nhận hàng</h3>
            <p>${order.shippingAddress}</p>
        </div>
        <div class="admin-order-products">
            <h3>Sản phẩm</h3>
            <div class="table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã SP</th>
                            <th>Tên sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.productId}</td>
                                <td>${item.productName}</td>
                                <td>${orderFormatCurrency(item.unitPrice)}</td>
                                <td>${item.quantity}</td>
                                <td><strong>${orderFormatCurrency(item.subtotal)}</strong></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="admin-order-detail-total">
            <span>Tổng tiền đơn hàng</span>
            <strong>${orderFormatCurrency(order.totalAmount)}</strong>
        </div>
    `;
    modal.classList.add("show");
}

function resetAdminFilter() {
    const search = document.getElementById("adminOrderSearch");
    const from = document.getElementById("adminDateFrom");
    const to = document.getElementById("adminDateTo");
    const status = document.getElementById("adminStatusFilter");

    if (search) search.value = "";
    if (from) from.value = "";
    if (to) to.value = "";
    if (status) status.value = "";
    renderAdminOrders();
}

function setupOrderModals() {
    const customerModal = document.getElementById("customerOrderModal");
    const customerClose = document.getElementById("closeCustomerOrderModal");
    if (customerModal && customerClose) {
        customerClose.addEventListener("click", function () {
            customerModal.classList.remove("show");
        });
    }

    const adminModal = document.getElementById("adminOrderModal");
    const adminClose = document.getElementById("closeAdminOrderModal");
    if (adminModal && adminClose) {
        adminClose.addEventListener("click", function () {
            adminModal.classList.remove("show");
        });
    }

    window.addEventListener("click", function (event) {
        if (event.target === customerModal) customerModal.classList.remove("show");
        if (event.target === adminModal) adminModal.classList.remove("show");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    renderSuccessOrder();
    renderCustomerOrders();
    renderAdminOrders();
    setupOrderModals();

    const filterButton = document.getElementById("adminFilterBtn");
    if (filterButton) filterButton.addEventListener("click", renderAdminOrders);

    const resetButton = document.getElementById("adminResetFilterBtn");
    if (resetButton) resetButton.addEventListener("click", resetAdminFilter);
});
