/* ==========================================================
   BOOKHUB - admin.js
   Yêu cầu: nạp data.js TRƯỚC file này (getData / setData nằm ở data.js).
   Mọi thay đổi về giá bán và tồn kho ghi vào localStorage "products",
   trang khách (products.js) đọc đúng nguồn này nên luôn đồng bộ.
   ========================================================== */

/* ==================== DATA ==================== */

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

/* ==================== ADMIN-LOGIN CHECK ==================== */
// ============== KIỂM TRA ĐĂNG NHẬP ADMIN ==============

function getCurrentAdmin() {
    return localStorage.getItem("adminLoggedIn") === "true";
}

function requireAdminLogin() {
    if (getCurrentAdmin()) return true;

    window.location.replace("login.html");
    return false;
}

// Kiểm tra ngay khi tải file
requireAdminLogin();
/* ==================== DASHBOARD ==================== */

function renderDashboard() {
    const products = getData("products");
    const categories = getData("categories");
    const customers = getData("customers");
    const orders = getData("orders");

    const revenue = orders
        .filter(o => o.orderStatus !== "cancelled")
        .reduce((s, o) => s + Number(o.totalAmount || 0), 0);

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    set("productCount", products.length);
    set("categoryCount", categories.length);
    set("customerCount", customers.length);
    set("orderCount", orders.length);
    set("revenue", money(revenue));
    set("pendingCount", orders.filter(o => o.orderStatus === "pending").length);

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
        // Object.assign giữ nguyên trường "key" mà trang khách dùng để lọc
        const c = data.find(x => x.categoryId === id);
        if (c) Object.assign(c, { categoryName: name, status });
    } else {
        const categoryId = generateId("DM", data, "categoryId");
        const keyBase = name.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D")
            .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        let key = keyBase || categoryId.toLowerCase();
        if (data.some(c => c.key === key)) key = `${key}-${categoryId.toLowerCase()}`;
        data.push({ categoryId, key, categoryName: name, status });
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
        productDescription: p?.description || "",
        productImage: p?.image || ""
    };

    // Phải đổ danh sách <option> trước khi gán value cho select
    document.getElementById("productCategory").innerHTML =
        categories.map(c =>
            `<option value="${c.categoryId}">${c.categoryName}</option>`
        ).join("");

    Object.entries(fields).forEach(([fieldId, value]) =>
        document.getElementById(fieldId).value = value
    );

    
    const imageInput = document.getElementById("productImage");
    const imagePreview = document.getElementById("productImagePreview");

    imageInput.value = "";

    const savedImage = p?.image || "";

    if (savedImage) {
        imagePreview.src = savedImage;
        imagePreview.style.display = "block";
    } else {
        imagePreview.removeAttribute("src");
        imagePreview.style.display = "none";
    }

    imageInput.onchange = () => {
        const file = imageInput.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn một tệp hình ảnh.");
            imageInput.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Ảnh không được vượt quá 2 MB.");
            imageInput.value = "";
            return;
        }

        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = "block";
    };

    function updateProductImagePreview() {
        const value = imageInput.value.trim();

        if (!value) {
            imagePreview.style.display = "none";
            imagePreview.removeAttribute("src");
            return;
        }

        imagePreview.src = /^https?:\/\//i.test(value) || value.startsWith("/")
            ? value
            : "../images/books/" + value;

        imagePreview.style.display = "block";
    }

    imageInput.oninput = updateProductImagePreview;
    imagePreview.onerror = () => {
        imagePreview.style.display = "none";
    };

    updateProductImagePreview();

    document.getElementById("productModalTitle").textContent =
        p ? "Sửa sản phẩm" : "Thêm sản phẩm";

    modal.classList.add("show");
}

function closeProductForm() {
    document.getElementById("productModal")?.classList.remove("show");
}


async function saveProduct(e) {
    e.preventDefault();

    const products = getData("products");
    const id = document.getElementById("productId").value;
    const oldProduct = products.find(x => x.productId === id);

    const imageInput = document.getElementById("productImage");
    const file = imageInput.files[0];

    let image = oldProduct?.image || "";

    if (file) {
        if (!file.type.startsWith("image/")) {
            return alert("Vui lòng chọn một tệp hình ảnh hợp lệ.");
        }

        if (file.size > 2 * 1024 * 1024) {
            return alert("Ảnh không được vượt quá 2 MB.");
        }

        try {
            image = await new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error("Không đọc được ảnh"));

                reader.readAsDataURL(file);
            });
        } catch {
            return alert("Không thể đọc ảnh. Vui lòng thử lại.");
        }
    }

    const p = {
        productId: id || generateId("MS", products, "productId"),
        productName: document.getElementById("productName").value.trim(),
        categoryId: document.getElementById("productCategory").value,
        author: document.getElementById("productAuthor").value.trim(),
        publisher: document.getElementById("productPublisher").value.trim(),
        importPrice: Number(document.getElementById("productImportPrice").value),
        profitRate: Number(document.getElementById("productProfitRate").value),
        stockQuantity: Number(document.getElementById("productStock").value),
        description: document.getElementById("productDescription").value.trim(),
        image,
        status: oldProduct?.status || "active"
    };

    if (!p.productName) {
        return alert("Vui lòng nhập tên sản phẩm.");
    }

    if (p.importPrice < 0 || p.profitRate < 0 || p.stockQuantity < 0) {
        return alert("Giá nhập, lợi nhuận và tồn kho không được âm.");
    }

    p.salePrice = Math.round(
        p.importPrice * (1 + p.profitRate / 100)
    );

    const index = products.findIndex(x => x.productId === id);

    if (index >= 0) {
        products[index] = { ...products[index], ...p };
    } else {
        products.push(p);
    }

    try {
        setData("products", products);
    } catch {
        return alert("Không đủ dung lượng lưu ảnh. Hãy chọn ảnh nhỏ hơn.");
    }

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
        (c.customerId || "").toLowerCase().includes(key) ||
        (c.username || "").toLowerCase().includes(key) ||
        (c.fullName || "").toLowerCase().includes(key) ||
        (c.email || "").toLowerCase().includes(key)
    );

    tbody.innerHTML = result.length ? result.map(c => `
        <tr>
            <td>${c.customerId}</td>
            <td>${c.username || ""}</td>
            <td>${c.fullName || ""}</td>
            <td>${c.email || ""}</td>
            <td>${c.phone || ""}</td>
            <td>${c.address || ""}</td>
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

/*
 * Đồng bộ tồn kho theo trạng thái đơn:
 *  - Hủy đơn (từ trạng thái khác)  -> cộng lại tồn kho
 *  - Mở lại đơn đã hủy             -> trừ lại tồn kho (không đủ hàng thì từ chối)
 * Giả định: khi khách đặt hàng, trang checkout đã trừ tồn kho.
 */
function changeOrderStatus(id, status) {
    const orders = getData("orders");
    const order = orders.find(o => o.orderId === id);
    if (!order) return;

    const wasCancelled = order.orderStatus === "cancelled";
    const willCancel = status === "cancelled";

    if (wasCancelled !== willCancel) {
        const products = getData("products");
        const items = order.items || [];

        if (wasCancelled) {
            // mở lại đơn: kiểm tra đủ hàng trước khi trừ
            const lacking = items.find(it => {
                const p = products.find(x => x.productId === it.productId);
                return !p || Number(p.stockQuantity || 0) < Number(it.quantity || 0);
            });

            if (lacking) {
                alert("Không đủ tồn kho để mở lại đơn hàng này");
                renderOrders();
                return;
            }
        }

        items.forEach(it => {
            const p = products.find(x => x.productId === it.productId);
            if (!p) return;

            const qty = Number(it.quantity || 0);
            const stock = Number(p.stockQuantity || 0);
            p.stockQuantity = willCancel ? stock + qty : stock - qty;
        });

        setData("products", products);
    }

    order.orderStatus = status;
    setData("orders", orders);

    renderOrders();
    renderDashboard();
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

    // Nhập hàng: tăng tồn kho, cập nhật giá nhập và tính lại giá bán
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
    if (!confirm("Xóa phiếu nhập này? Tồn kho sẽ bị trừ lại tương ứng.")) return;

    const imports = getData("imports");
    const imp = imports.find(i => i.importId === id);

    if (imp) {
        const products = getData("products");

        (imp.items || []).forEach(it => {
            const p = products.find(x => x.productId === it.productId);
            if (p)
                p.stockQuantity = Math.max(
                    0,
                    Number(p.stockQuantity || 0) - Number(it.quantity || 0)
                );
        });

        setData("products", products);
    }

    setData("imports", imports.filter(i => i.importId !== id));

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
        result = result.filter(p => Number(p.stockQuantity) > 0 && Number(p.stockQuantity) <= 5);

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
    const out = document.getElementById("calculatedPrice");
    if (!out) return;

    const price = Number(document.getElementById("priceImport")?.value || 0);
    const profit = Number(document.getElementById("priceProfit")?.value || 0);

    out.textContent = money(Math.round(price * (1 + profit / 100)));
}

function savePrice(e) {
    e.preventDefault();

    const products = getData("products");
    const p = products.find(x =>
        x.productId === document.getElementById("priceProductId").value
    );

    if (!p) return;

    const importPrice = Number(document.getElementById("priceImport").value);
    const profitRate = Number(document.getElementById("priceProfit").value);

    if (importPrice < 0 || profitRate < 0)
        return alert("Giá nhập và tỷ lệ lợi nhuận không được âm");

    p.importPrice = importPrice;
    p.profitRate = profitRate;
    p.salePrice = Math.round(p.importPrice * (1 + p.profitRate / 100));

    setData("products", products);
    closePriceForm();
    renderPrices();
}


/* ==================== EVENTS ==================== */

document.addEventListener("DOMContentLoaded", () => {
    
    if (!requireAdminLogin()) return;

    // Xử lý đăng xuất
    document.querySelector(".admin-header .logout-link")
        ?.addEventListener("click", event => {
            event.preventDefault();

            localStorage.removeItem("adminLoggedIn");
            window.location.replace("login.html");
        });

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