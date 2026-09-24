/* ==================== DATA ==================== */

const getData = key => JSON.parse(localStorage.getItem(key)) || [];
const setData = (key, data) =>
    localStorage.setItem(key, JSON.stringify(data));

const money = v => Number(v || 0).toLocaleString("vi-VN") + " VNĐ";

const statusText = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    delivered: "Đã giao",
    cancelled: "Đã hủy"
};

const getOrderStatus = s => statusText[s] || s;

function generateId(prefix, data, field) {
    const max = data.reduce((m, x) => {
        const n = parseInt(String(x[field] || "").replace(prefix, ""));
        return !isNaN(n) && n > m ? n : m;
    }, 0);

    return prefix + String(max + 1).padStart(3, "0");
}


/* ==================== DASHBOARD ==================== */

function renderDashboard() {
    const products = getData("products");
    const categories = getData("categories");
    const customers = getData("customers");
    const orders = getData("orders");

    const revenue = orders
        .filter(o => o.orderStatus !== "cancelled")
        .reduce((s, o) => s + Number(o.totalAmount || 0), 0);

    document.getElementById("productCount").textContent = products.length;
    document.getElementById("categoryCount").textContent = categories.length;
    document.getElementById("customerCount").textContent = customers.length;
    document.getElementById("orderCount").textContent = orders.length;
    document.getElementById("revenue").textContent = money(revenue);
    document.getElementById("pendingCount").textContent =
        orders.filter(o => o.orderStatus === "pending").length;

    renderRecentOrders(orders);
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById("recentOrders");
    if (!tbody) return;

    const customers = getData("customers");

    const recent = [...orders]
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice(0, 5);

    tbody.innerHTML = recent.length ? recent.map(o => {
        const c = customers.find(x => x.customerId === o.customerId);

        return `
        <tr>
            <td>${o.orderId}</td>
            <td>${c?.fullName || o.customerId}</td>
            <td>${o.orderDate}</td>
            <td>${money(o.totalAmount)}</td>
            <td><span class="badge badge-${o.orderStatus}">
                ${getOrderStatus(o.orderStatus)}
            </span></td>
        </tr>`;
    }).join("") : `
        <tr><td colspan="5" class="empty">Chưa có đơn hàng</td></tr>
    `;
}


/* ==================== CATEGORY ==================== */

function renderCategories() {
    const tbody = document.getElementById("categoryList");
    if (!tbody) return;

    const categories = getData("categories");
    const products = getData("products");
    const key = document.getElementById("categorySearch")?.value.toLowerCase() || "";

    const result = categories.filter(c =>
        c.categoryId.toLowerCase().includes(key) ||
        c.categoryName.toLowerCase().includes(key)
    );

    tbody.innerHTML = result.length ? result.map(c => {
        const count = products.filter(p => p.categoryId === c.categoryId).length;

        return `
        <tr>
            <td>${c.categoryId}</td>
            <td>${c.categoryName}</td>
            <td>${count}</td>
            <td><span class="badge badge-${c.status}">
                ${c.status === "active" ? "Hoạt động" : "Ẩn"}
            </span></td>
            <td>
                <button class="btn btn-small"
                    onclick="editCategory('${c.categoryId}')">Sửa</button>
                <button class="btn btn-small btn-danger"
                    onclick="deleteCategory('${c.categoryId}')">Xóa</button>
            </td>
        </tr>`;
    }).join("") : `
        <tr><td colspan="5" class="empty">Không có danh mục</td></tr>
    `;
}

function openCategoryForm(id = "") {
    const modal = document.getElementById("categoryModal");
    if (!modal) return;

    const c = getData("categories").find(x => x.categoryId === id);

    document.getElementById("categoryId").value = c?.categoryId || "";
    document.getElementById("categoryName").value = c?.categoryName || "";
    document.getElementById("categoryStatus").value = c?.status || "active";
    document.getElementById("categoryModalTitle").textContent =
        c ? "Sửa danh mục" : "Thêm danh mục";

    modal.classList.add("show");
}

function closeCategoryForm() {
    document.getElementById("categoryModal")?.classList.remove("show");
}

function saveCategory(e) {
    e.preventDefault();

    const data = getData("categories");
    const id = document.getElementById("categoryId").value;
    const name = document.getElementById("categoryName").value.trim();
    const status = document.getElementById("categoryStatus").value;

    if (!name) return alert("Vui lòng nhập tên danh mục");

    if (id) {
        const c = data.find(x => x.categoryId === id);
        if (c) Object.assign(c, { categoryName: name, status });
    } else {
        data.push({
            categoryId: generateId("DM", data, "categoryId"),
            categoryName: name,
            status
        });
    }

    setData("categories", data);
    closeCategoryForm();
    renderCategories();
}

const editCategory = id => openCategoryForm(id);

function deleteCategory(id) {
    if (getData("products").some(p => p.categoryId === id))
        return alert("Không thể xóa danh mục đang có sản phẩm");

    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    setData("categories",
        getData("categories").filter(c => c.categoryId !== id)
    );

    renderCategories();
}


/* ==================== PRODUCT ==================== */

function renderProducts() {
    const tbody = document.getElementById("productList");
    if (!tbody) return;

    const products = getData("products");
    const categories = getData("categories");
    const key = document.getElementById("productSearch")?.value.toLowerCase() || "";

    const result = products.filter(p =>
        p.productId.toLowerCase().includes(key) ||
        p.productName.toLowerCase().includes(key) ||
        (p.author || "").toLowerCase().includes(key)
    );

    tbody.innerHTML = result.length ? result.map(p => {
        const c = categories.find(x => x.categoryId === p.categoryId);

        return `
        <tr>
            <td>${p.productId}</td>
            <td>${p.productName}</td>
            <td>${c?.categoryName || ""}</td>
            <td>${p.author || ""}</td>
            <td>${money(p.importPrice)}</td>
            <td>${money(p.salePrice)}</td>
            <td>${p.stockQuantity || 0}</td>
            <td>
                <button class="btn btn-small"
                    onclick="editProduct('${p.productId}')">Sửa</button>
                <button class="btn btn-small btn-danger"
                    onclick="deleteProduct('${p.productId}')">Xóa</button>
            </td>
        </tr>`;
    }).join("") : `
        <tr><td colspan="8" class="empty">Không có sản phẩm</td></tr>
    `;
}

function openProductForm(id = "") {
    const modal = document.getElementById("productModal");
    if (!modal) return;

    const categories = getData("categories");
    const p = getData("products").find(x => x.productId === id);

    const fields = {
        productId: p?.productId || "",
        productName: p?.productName || "",
        productAuthor: p?.author || "",
        productPublisher: p?.publisher || "",
        productCategory: p?.categoryId || categories[0]?.categoryId || "",
        productImportPrice: p?.importPrice || 0,
        productProfitRate: p?.profitRate || 30,
        productStock: p?.stockQuantity || 0,
        productDescription: p?.description || ""
    };

    document.getElementById("productCategory").innerHTML =
        categories.map(c =>
            `<option value="${c.categoryId}">${c.categoryName}</option>`
        ).join("");

    Object.entries(fields).forEach(([id, value]) =>
        document.getElementById(id).value = value
    );

    document.getElementById("productModalTitle").textContent =
        p ? "Sửa sản phẩm" : "Thêm sản phẩm";

    modal.classList.add("show");
}

function closeProductForm() {
    document.getElementById("productModal")?.classList.remove("show");
}

function saveProduct(e) {
    e.preventDefault();

    const products = getData("products");
    const id = document.getElementById("productId").value;

    const p = {
        productId: id || generateId("SP", products, "productId"),
        productName: document.getElementById("productName").value.trim(),
        categoryId: document.getElementById("productCategory").value,
        author: document.getElementById("productAuthor").value.trim(),
        publisher: document.getElementById("productPublisher").value.trim(),
        importPrice: Number(document.getElementById("productImportPrice").value),
        profitRate: Number(document.getElementById("productProfitRate").value),
        stockQuantity: Number(document.getElementById("productStock").value),
        description: document.getElementById("productDescription").value.trim(),
        status: "active"
    };

    if (!p.productName)
        return alert("Vui lòng nhập tên sản phẩm");

    p.salePrice = Math.round(
        p.importPrice * (1 + p.profitRate / 100)
    );

    const index = products.findIndex(x => x.productId === id);

    if (index >= 0)
        products[index] = { ...products[index], ...p };
    else
        products.push({ ...p, image: "" });

    setData("products", products);
    closeProductForm();
    renderProducts();
}

const editProduct = id => openProductForm(id);

function deleteProduct(id) {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    setData("products",
        getData("products").filter(p => p.productId !== id)
    );

    renderProducts();
}


/* ==================== CUSTOMER ==================== */

function renderCustomers() {
    const tbody = document.getElementById("customerList");
    if (!tbody) return;

    const key = document.getElementById("customerSearch")?.value.toLowerCase() || "";

    const result = getData("customers").filter(c =>
        c.customerId.toLowerCase().includes(key) ||
        c.username.toLowerCase().includes(key) ||
        c.fullName.toLowerCase().includes(key) ||
        c.email.toLowerCase().includes(key)
    );

    tbody.innerHTML = result.length ? result.map(c => `
        <tr>
            <td>${c.customerId}</td>
            <td>${c.username}</td>
            <td>${c.fullName}</td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td>${c.address}</td>
            <td><span class="badge badge-${c.status}">
                ${c.status === "active" ? "Hoạt động" : "Khóa"}
            </span></td>
        </tr>
    `).join("") : `
        <tr><td colspan="7" class="empty">Không có khách hàng</td></tr>
    `;
}


/* ==================== ORDER ==================== */

function renderOrders() {
    const tbody = document.getElementById("orderList");
    if (!tbody) return;

    const orders = getData("orders");
    const customers = getData("customers");

    tbody.innerHTML = orders.length ? orders.map(o => {
        const c = customers.find(x => x.customerId === o.customerId);

        return `
        <tr>
            <td>${o.orderId}</td>
            <td>${c?.fullName || o.customerId}</td>
            <td>${o.orderDate}</td>
            <td>${o.items?.length || 0}</td>
            <td>${money(o.totalAmount)}</td>
            <td><span class="badge badge-${o.orderStatus}">
                ${getOrderStatus(o.orderStatus)}
            </span></td>
            <td>
                <select onchange="changeOrderStatus('${o.orderId}',this.value)">
                    ${Object.entries(statusText).map(([v, t]) =>
                        `<option value="${v}" ${o.orderStatus === v ? "selected" : ""}>${t}</option>`
                    ).join("")}
                </select>
            </td>
        </tr>`;
    }).join("") : `
        <tr><td colspan="7" class="empty">Chưa có đơn hàng</td></tr>
    `;
}

function changeOrderStatus(id, status) {
    const orders = getData("orders");
    const order = orders.find(o => o.orderId === id);

    if (order) order.orderStatus = status;

    setData("orders", orders);
    renderOrders();
}


/* ==================== IMPORT ==================== */

function renderImports() {
    const tbody = document.getElementById("importList");
    if (!tbody) return;

    const data = getData("imports");

    tbody.innerHTML = data.length ? data.map(i => `
        <tr>
            <td>${i.importId}</td>
            <td>${i.importDate}</td>
            <td>${i.items?.length || 0}</td>
            <td>${money(i.totalAmount)}</td>
            <td><span class="badge badge-completed">Hoàn tất</span></td>
            <td>
                <button class="btn btn-small btn-danger"
                    onclick="deleteImport('${i.importId}')">Xóa</button>
            </td>
        </tr>
    `).join("") : `
        <tr><td colspan="6" class="empty">Chưa có phiếu nhập</td></tr>
    `;
}

function openImportForm() {
    const modal = document.getElementById("importModal");
    if (!modal) return;

    const products = getData("products");

    document.getElementById("importDate").value =
        new Date().toISOString().split("T")[0];

    document.getElementById("importProduct").innerHTML =
        products.map(p =>
            `<option value="${p.productId}">${p.productName}</option>`
        ).join("");

    document.getElementById("importQuantity").value = 1;
    document.getElementById("importPrice").value = 0;

    modal.classList.add("show");
}

function closeImportForm() {
    document.getElementById("importModal")?.classList.remove("show");
}

function saveImport(e) {
    e.preventDefault();

    const products = getData("products");
    const imports = getData("imports");

    const product = products.find(p =>
        p.productId === document.getElementById("importProduct").value
    );

    const quantity = Number(document.getElementById("importQuantity").value);
    const price = Number(document.getElementById("importPrice").value);
    const date = document.getElementById("importDate").value;

    if (!product || quantity <= 0 || price <= 0)
        return alert("Dữ liệu phiếu nhập không hợp lệ");

    product.stockQuantity = Number(product.stockQuantity || 0) + quantity;
    product.importPrice = price;
    product.salePrice = Math.round(
        price * (1 + Number(product.profitRate || 30) / 100)
    );

    const item = {
        productId: product.productId,
        quantity,
        importPrice: price,
        subtotal: quantity * price
    };

    imports.push({
        importId: generateId("PN", imports, "importId"),
        importDate: date,
        items: [item],
        totalAmount: item.subtotal,
        status: "completed"
    });

    setData("products", products);
    setData("imports", imports);

    closeImportForm();
    renderImports();
}

function deleteImport(id) {
    if (!confirm("Xóa phiếu nhập này?")) return;

    setData("imports",
        getData("imports").filter(i => i.importId !== id)
    );

    renderImports();
}


/* ==================== INVENTORY ==================== */

function renderInventory() {
    const tbody = document.getElementById("inventoryList");
    if (!tbody) return;

    const products = getData("products");
    const categories = getData("categories");

    const filter = document.getElementById("inventoryFilter")?.value || "all";
    const key = document.getElementById("inventorySearch")?.value.toLowerCase() || "";

    let result = products.filter(p =>
        p.productId.toLowerCase().includes(key) ||
        p.productName.toLowerCase().includes(key)
    );

    if (filter === "low")
        result = result.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5);

    if (filter === "out")
        result = result.filter(p => Number(p.stockQuantity) === 0);

    if (filter === "available")
        result = result.filter(p => Number(p.stockQuantity) > 0);

    tbody.innerHTML = result.length ? result.map(p => {
        const stock = Number(p.stockQuantity || 0);
        const c = categories.find(x => x.categoryId === p.categoryId);

        return `
        <tr>
            <td>${p.productId}</td>
            <td>${p.productName}</td>
            <td>${c?.categoryName || ""}</td>
            <td>${stock}</td>
            <td>${money(p.importPrice)}</td>
            <td>${money(stock * Number(p.importPrice || 0))}</td>
            <td>
                <span class="badge ${
                    stock === 0 ? "badge-cancelled" :
                    stock <= 5 ? "badge-pending" : "badge-active"
                }">
                    ${stock === 0 ? "Hết hàng" :
                      stock <= 5 ? "Sắp hết" : "Còn hàng"}
                </span>
            </td>
        </tr>`;
    }).join("") : `
        <tr><td colspan="7" class="empty">Không có dữ liệu tồn kho</td></tr>
    `;
}


/* ==================== PRICE ==================== */

function renderPrices() {
    const tbody = document.getElementById("priceList");
    if (!tbody) return;

    const key = document.getElementById("priceSearch")?.value.toLowerCase() || "";

    const result = getData("products").filter(p =>
        p.productId.toLowerCase().includes(key) ||
        p.productName.toLowerCase().includes(key)
    );

    tbody.innerHTML = result.length ? result.map(p => `
        <tr>
            <td>${p.productId}</td>
            <td>${p.productName}</td>
            <td>${money(p.importPrice)}</td>
            <td>${p.profitRate || 0}%</td>
            <td>${money(p.salePrice)}</td>
            <td>
                <button class="btn btn-small"
                    onclick="openPriceForm('${p.productId}')">Sửa</button>
            </td>
        </tr>
    `).join("") : `
        <tr><td colspan="6" class="empty">Không có sản phẩm</td></tr>
    `;
}

function openPriceForm(id) {
    const p = getData("products").find(x => x.productId === id);
    if (!p) return;

    document.getElementById("priceProductId").value = p.productId;
    document.getElementById("priceProductName").value = p.productName;
    document.getElementById("priceImport").value = p.importPrice;
    document.getElementById("priceProfit").value = p.profitRate || 30;

    calculatePrice();
    document.getElementById("priceModal").classList.add("show");
}

function closePriceForm() {
    document.getElementById("priceModal")?.classList.remove("show");
}

function calculatePrice() {
    const price = Number(document.getElementById("priceImport")?.value || 0);
    const profit = Number(document.getElementById("priceProfit")?.value || 0);

    document.getElementById("calculatedPrice").textContent =
        money(Math.round(price * (1 + profit / 100)));
}

function savePrice(e) {
    e.preventDefault();

    const products = getData("products");
    const p = products.find(x =>
        x.productId === document.getElementById("priceProductId").value
    );

    if (!p) return;

    p.importPrice = Number(document.getElementById("priceImport").value);
    p.profitRate = Number(document.getElementById("priceProfit").value);
    p.salePrice = Math.round(p.importPrice * (1 + p.profitRate / 100));

    setData("products", products);
    closePriceForm();
    renderPrices();
}


/* ==================== EVENTS ==================== */

document.addEventListener("DOMContentLoaded", () => {

    [
        renderDashboard,
        renderProducts,
        renderCategories,
        renderCustomers,
        renderOrders,
        renderImports,
        renderInventory,
        renderPrices
    ].forEach(fn => fn());

    const events = {
        categorySearch: ["input", renderCategories],
        productSearch: ["input", renderProducts],
        customerSearch: ["input", renderCustomers],
        inventorySearch: ["input", renderInventory],
        inventoryFilter: ["change", renderInventory],
        priceSearch: ["input", renderPrices],
        priceImport: ["input", calculatePrice],
        priceProfit: ["input", calculatePrice]
    };

    Object.entries(events).forEach(([id, [event, fn]]) =>
        document.getElementById(id)?.addEventListener(event, fn)
    );
});
