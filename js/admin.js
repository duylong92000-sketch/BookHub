/* Admin dashboard */

function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function money(value) {
    return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
}

function renderDashboard() {
    const products = getData("products");
    const categories = getData("categories");
    const customers = getData("customers");
    const orders = getData("orders");

    const revenue = orders
        .filter(order => order.orderStatus !== "cancelled")
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    const pending = orders.filter(
        order => order.orderStatus === "pending"
    ).length;

    document.getElementById("productCount").textContent = products.length;
    document.getElementById("categoryCount").textContent = categories.length;
    document.getElementById("customerCount").textContent = customers.length;
    document.getElementById("orderCount").textContent = orders.length;
    document.getElementById("revenue").textContent = money(revenue);
    document.getElementById("pendingCount").textContent = pending;

    renderRecentOrders(orders);
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById("recentOrders");

    if (!tbody) {
        return;
    }

    const recent = [...orders]
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Chưa có đơn hàng
                </td>
            </tr>
        `;
        return;
    }

    const customers = getData("customers");

    tbody.innerHTML = recent.map(order => {
        const customer = customers.find(
            item => item.customerId === order.customerId
        );

        return `
            <tr>
                <td>${order.orderId}</td>
                <td>${customer ? customer.fullName : order.customerId}</td>
                <td>${order.orderDate}</td>
                <td>${money(order.totalAmount)}</td>
                <td>
                    <span class="badge badge-${order.orderStatus}">
                        ${getOrderStatus(order.orderStatus)}
                    </span>
                </td>
            </tr>
        `;
    }).join("");
}

function getOrderStatus(status) {
    const data = {
        pending: "Chờ xử lý",
        processing: "Đang xử lý",
        delivered: "Đã giao",
        cancelled: "Đã hủy"
    };

    return data[status] || status;
}

document.addEventListener("DOMContentLoaded", renderDashboard);

/* Admin data */

function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function money(value) {
    return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
}

function generateId(prefix, data, field) {
    let max = 0;

    data.forEach(item => {
        const number = parseInt(
            String(item[field] || "").replace(prefix, "")
        );

        if (!isNaN(number) && number > max) {
            max = number;
        }
    });

    return prefix + String(max + 1).padStart(3, "0");
}

/* Category */

function renderCategories() {
    const tbody = document.getElementById("categoryList");

    if (!tbody) {
        return;
    }

    const categories = getData("categories");
    const products = getData("products");
    const keyword = (
        document.getElementById("categorySearch")?.value || ""
    ).toLowerCase();

    const result = categories.filter(category =>
        category.categoryId.toLowerCase().includes(keyword) ||
        category.categoryName.toLowerCase().includes(keyword)
    );

    if (result.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Không có danh mục
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = result.map(category => {
        const count = products.filter(
            product => product.categoryId === category.categoryId
        ).length;

        return `
            <tr>
                <td>${category.categoryId}</td>
                <td>${category.categoryName}</td>
                <td>${count}</td>
                <td>
                    <span class="badge badge-${category.status}">
                        ${category.status === "active" ? "Hoạt động" : "Ẩn"}
                    </span>
                </td>
                <td>
                    <div class="actions">
                        <button class="btn btn-small"
                            onclick="editCategory('${category.categoryId}')">
                            Sửa
                        </button>

                        <button class="btn btn-small btn-danger"
                            onclick="deleteCategory('${category.categoryId}')">
                            Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function openCategoryForm(id = "") {
    const modal = document.getElementById("categoryModal");

    if (!modal) {
        return;
    }

    document.getElementById("categoryId").value = "";
    document.getElementById("categoryName").value = "";
    document.getElementById("categoryStatus").value = "active";
    document.getElementById("categoryModalTitle").textContent =
        "Thêm danh mục";

    if (id) {
        const categories = getData("categories");

        const category = categories.find(
            item => item.categoryId === id
        );

        if (!category) {
            return;
        }

        document.getElementById("categoryId").value = category.categoryId;
        document.getElementById("categoryName").value = category.categoryName;
        document.getElementById("categoryStatus").value = category.status;
        document.getElementById("categoryModalTitle").textContent =
            "Sửa danh mục";
    }

    modal.classList.add("show");
}

function closeCategoryForm() {
    document.getElementById("categoryModal")?.classList.remove("show");
}

function saveCategory(event) {
    event.preventDefault();

    const categories = getData("categories");

    const id = document.getElementById("categoryId").value;

    const name = document
        .getElementById("categoryName")
        .value.trim();

    const status = document.getElementById("categoryStatus").value;

    if (!name) {
        alert("Vui lòng nhập tên danh mục");
        return;
    }

    if (id) {
        const category = categories.find(
            item => item.categoryId === id
        );

        if (category) {
            category.categoryName = name;
            category.status = status;
        }
    } else {
        categories.push({
            categoryId: generateId(
                "DM",
                categories,
                "categoryId"
            ),
            categoryName: name,
            status: status
        });
    }

    setData("categories", categories);

    closeCategoryForm();
    renderCategories();
}

function editCategory(id) {
    openCategoryForm(id);
}

function deleteCategory(id) {
    const products = getData("products");

    const used = products.some(
        product => product.categoryId === id
    );

    if (used) {
        alert("Không thể xóa danh mục đang có sản phẩm");
        return;
    }

    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) {
        return;
    }

    const categories = getData("categories").filter(
        category => category.categoryId !== id
    );

    setData("categories", categories);

    renderCategories();
}

/* Product */

function renderProducts() {
    const tbody = document.getElementById("productList");

    if (!tbody) {
        return;
    }

    const products = getData("products");
    const categories = getData("categories");

    const keyword = (
        document.getElementById("productSearch")?.value || ""
    ).toLowerCase();

    const result = products.filter(product =>
        product.productId.toLowerCase().includes(keyword) ||
        product.productName.toLowerCase().includes(keyword) ||
        product.author.toLowerCase().includes(keyword)
    );

    if (result.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    Không có sản phẩm
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = result.map(product => {
        const category = categories.find(
            item => item.categoryId === product.categoryId
        );

        return `
            <tr>
                <td>${product.productId}</td>
                <td>${product.productName}</td>
                <td>${category?.categoryName || ""}</td>
                <td>${product.author || ""}</td>
                <td>${money(product.importPrice)}</td>
                <td>${money(product.salePrice)}</td>
                <td>${product.stockQuantity || 0}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-small"
                            onclick="editProduct('${product.productId}')">
                            Sửa
                        </button>

                        <button class="btn btn-small btn-danger"
                            onclick="deleteProduct('${product.productId}')">
                            Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function openProductForm(id = "") {
    const modal = document.getElementById("productModal");

    if (!modal) {
        return;
    }

    const categories = getData("categories");

    const select = document.getElementById("productCategory");

    select.innerHTML = categories.map(category => `
        <option value="${category.categoryId}">
            ${category.categoryName}
        </option>
    `).join("");

    document.getElementById("productId").value = "";
    document.getElementById("productName").value = "";
    document.getElementById("productAuthor").value = "";
    document.getElementById("productPublisher").value = "";
    document.getElementById("productCategory").value =
        categories[0]?.categoryId || "";
    document.getElementById("productImportPrice").value = 0;
    document.getElementById("productProfitRate").value = 30;
    document.getElementById("productStock").value = 0;
    document.getElementById("productDescription").value = "";

    document.getElementById("productModalTitle").textContent =
        "Thêm sản phẩm";

    if (id) {
        const products = getData("products");

        const product = products.find(
            item => item.productId === id
        );

        if (!product) {
            return;
        }

        document.getElementById("productId").value = product.productId;
        document.getElementById("productName").value = product.productName;
        document.getElementById("productAuthor").value = product.author || "";
        document.getElementById("productPublisher").value =
            product.publisher || "";
        document.getElementById("productCategory").value =
            product.categoryId;
        document.getElementById("productImportPrice").value =
            product.importPrice || 0;
        document.getElementById("productProfitRate").value =
            product.profitRate || 30;
        document.getElementById("productStock").value =
            product.stockQuantity || 0;
        document.getElementById("productDescription").value =
            product.description || "";

        document.getElementById("productModalTitle").textContent =
            "Sửa sản phẩm";
    }

    modal.classList.add("show");
}

function closeProductForm() {
    document.getElementById("productModal")?.classList.remove("show");
}

function saveProduct(event) {
    event.preventDefault();

    const products = getData("products");

    const id = document.getElementById("productId").value;

    const product = {
        productId: id || generateId(
            "SP",
            products,
            "productId"
        ),

        productName: document
            .getElementById("productName")
            .value.trim(),

        categoryId: document.getElementById("productCategory").value,

        author: document
            .getElementById("productAuthor")
            .value.trim(),

        publisher: document
            .getElementById("productPublisher")
            .value.trim(),

        importPrice: Number(
            document.getElementById("productImportPrice").value
        ),

        profitRate: Number(
            document.getElementById("productProfitRate").value
        ),

        stockQuantity: Number(
            document.getElementById("productStock").value
        ),

        description: document
            .getElementById("productDescription")
            .value.trim(),

        status: "active"
    };

    product.salePrice = Math.round(
        product.importPrice +
        product.importPrice * product.profitRate / 100
    );

    if (!product.productName) {
        alert("Vui lòng nhập tên sản phẩm");
        return;
    }

    if (id) {
        const index = products.findIndex(
            item => item.productId === id
        );

        if (index !== -1) {
            product.image = products[index].image || "";
            products[index] = {
                ...products[index],
                ...product
            };
        }
    } else {
        product.image = "";

        products.push(product);
    }

    setData("products", products);

    closeProductForm();
    renderProducts();
}

function editProduct(id) {
    openProductForm(id);
}

function deleteProduct(id) {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        return;
    }

    const products = getData("products").filter(
        product => product.productId !== id
    );

    setData("products", products);

    renderProducts();
}

/* Customers */

function renderCustomers() {
    const tbody = document.getElementById("customerList");

    if (!tbody) {
        return;
    }

    const customers = getData("customers");

    const keyword = (
        document.getElementById("customerSearch")?.value || ""
    ).toLowerCase();

    const result = customers.filter(customer =>
        customer.customerId.toLowerCase().includes(keyword) ||
        customer.username.toLowerCase().includes(keyword) ||
        customer.fullName.toLowerCase().includes(keyword) ||
        customer.email.toLowerCase().includes(keyword)
    );

    if (!result.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Không có khách hàng
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = result.map(customer => `
        <tr>
            <td>${customer.customerId}</td>
            <td>${customer.username}</td>
            <td>${customer.fullName}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.address}</td>
            <td>
                <span class="badge badge-${customer.status}">
                    ${customer.status === "active" ? "Hoạt động" : "Khóa"}
                </span>
            </td>
        </tr>
    `).join("");
}

/* Orders */

function renderOrders() {
    const tbody = document.getElementById("orderList");

    if (!tbody) {
        return;
    }

    const orders = getData("orders");
    const customers = getData("customers");

    if (!orders.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Chưa có đơn hàng
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const customer = customers.find(
            item => item.customerId === order.customerId
        );

        return `
            <tr>
                <td>${order.orderId}</td>
                <td>${customer?.fullName || order.customerId}</td>
                <td>${order.orderDate}</td>
                <td>${order.items?.length || 0}</td>
                <td>${money(order.totalAmount)}</td>
                <td>
                    <span class="badge badge-${order.orderStatus}">
                        ${getOrderStatus(order.orderStatus)}
                    </span>
                </td>
                <td>
                    <select
                        onchange="changeOrderStatus('${order.orderId}', this.value)">
                        <option value="pending"
                            ${order.orderStatus === "pending" ? "selected" : ""}>
                            Chờ xử lý
                        </option>

                        <option value="processing"
                            ${order.orderStatus === "processing" ? "selected" : ""}>
                            Đang xử lý
                        </option>

                        <option value="delivered"
                            ${order.orderStatus === "delivered" ? "selected" : ""}>
                            Đã giao
                        </option>

                        <option value="cancelled"
                            ${order.orderStatus === "cancelled" ? "selected" : ""}>
                            Đã hủy
                        </option>
                    </select>
                </td>
            </tr>
        `;
    }).join("");
}

function getOrderStatus(status) {
    const data = {
        pending: "Chờ xử lý",
        processing: "Đang xử lý",
        delivered: "Đã giao",
        cancelled: "Đã hủy"
    };

    return data[status] || status;
}

function changeOrderStatus(id, status) {
    const orders = getData("orders");

    const order = orders.find(
        item => item.orderId === id
    );

    if (order) {
        order.orderStatus = status;
    }

    setData("orders", orders);

    renderOrders();
}

/* Import */

function renderImports() {
    const tbody = document.getElementById("importList");

    if (!tbody) {
        return;
    }

    const imports = getData("imports");

    if (!imports.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Chưa có phiếu nhập
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = imports.map(item => `
        <tr>
            <td>${item.importId}</td>
            <td>${item.importDate}</td>
            <td>${item.items?.length || 0}</td>
            <td>${money(item.totalAmount)}</td>
            <td>
                <span class="badge badge-completed">
                    Hoàn tất
                </span>
            </td>
            <td>
                <button class="btn btn-small btn-danger"
                    onclick="deleteImport('${item.importId}')">
                    Xóa
                </button>
            </td>
        </tr>
    `).join("");
}

function openImportForm() {
    const modal = document.getElementById("importModal");

    if (!modal) {
        return;
    }

    const products = getData("products");

    document.getElementById("importDate").value =
        new Date().toISOString().split("T")[0];

    document.getElementById("importProduct").innerHTML =
        products.map(product => `
            <option value="${product.productId}">
                ${product.productName}
            </option>
        `).join("");

    document.getElementById("importQuantity").value = 1;
    document.getElementById("importPrice").value = 0;

    modal.classList.add("show");
}

function closeImportForm() {
    document.getElementById("importModal")?.classList.remove("show");
}

function saveImport(event) {
    event.preventDefault();

    const products = getData("products");
    const imports = getData("imports");

    const productId = document.getElementById("importProduct").value;

    const quantity = Number(
        document.getElementById("importQuantity").value
    );

    const importPrice = Number(
        document.getElementById("importPrice").value
    );

    const importDate =
        document.getElementById("importDate").value;

    const product = products.find(
        item => item.productId === productId
    );

    if (!product || quantity <= 0 || importPrice <= 0) {
        alert("Dữ liệu phiếu nhập không hợp lệ");
        return;
    }

    product.stockQuantity =
        Number(product.stockQuantity || 0) + quantity;

    product.importPrice = importPrice;

    product.salePrice = Math.round(
        importPrice +
        importPrice * Number(product.profitRate || 30) / 100
    );

    const item = {
        productId: productId,
        quantity: quantity,
        importPrice: importPrice,
        subtotal: quantity * importPrice
    };

    const receipt = {
        importId: generateId(
            "PN",
            imports,
            "importId"
        ),

        importDate: importDate,

        items: [item],

        totalAmount: item.subtotal,

        status: "completed"
    };

    imports.push(receipt);

    setData("products", products);
    setData("imports", imports);

    closeImportForm();

    renderImports();
}

function deleteImport(id) {
    if (!confirm("Xóa phiếu nhập này?")) {
        return;
    }

    const imports = getData("imports").filter(
        item => item.importId !== id
    );

    setData("imports", imports);

    renderImports();
}

/* Inventory */

function renderInventory() {
    const tbody = document.getElementById("inventoryList");

    if (!tbody) {
        return;
    }

    const products = getData("products");
    const categories = getData("categories");

    const filter =
        document.getElementById("inventoryFilter")?.value || "all";

    const keyword = (
        document.getElementById("inventorySearch")?.value || ""
    ).toLowerCase();

    let result = products.filter(product =>
        product.productId.toLowerCase().includes(keyword) ||
        product.productName.toLowerCase().includes(keyword)
    );

    if (filter === "low") {
        result = result.filter(
            product => Number(product.stockQuantity) > 0 &&
            Number(product.stockQuantity) <= 5
        );
    }

    if (filter === "out") {
        result = result.filter(
            product => Number(product.stockQuantity) === 0
        );
    }

    if (filter === "available") {
        result = result.filter(
            product => Number(product.stockQuantity) > 0
        );
    }

    if (!result.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Không có dữ liệu tồn kho
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = result.map(product => {
        const category = categories.find(
            item => item.categoryId === product.categoryId
        );

        const stock = Number(product.stockQuantity || 0);

        const inventoryValue =
            stock * Number(product.importPrice || 0);

        let stockClass = "";

        if (stock === 0) {
            stockClass = "out-stock";
        } else if (stock <= 5) {
            stockClass = "low-stock";
        }

        return `
            <tr>
                <td>${product.productId}</td>
                <td>${product.productName}</td>
                <td>${category?.categoryName || ""}</td>
                <td class="${stockClass}">
                    ${stock}
                </td>
                <td>${money(product.importPrice)}</td>
                <td>${money(inventoryValue)}</td>
                <td>
                    ${
                        stock === 0
                        ? `<span class="badge badge-cancelled">Hết hàng</span>`
                        : stock <= 5
                        ? `<span class="badge badge-pending">Sắp hết</span>`
                        : `<span class="badge badge-active">Còn hàng</span>`
                    }
                </td>
            </tr>
        `;
    }).join("");
}

/* Prices */

function renderPrices() {
    const tbody = document.getElementById("priceList");

    if (!tbody) {
        return;
    }

    const products = getData("products");

    const keyword = (
        document.getElementById("priceSearch")?.value || ""
    ).toLowerCase();

    const result = products.filter(product =>
        product.productId.toLowerCase().includes(keyword) ||
        product.productName.toLowerCase().includes(keyword)
    );

    if (!result.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Không có sản phẩm
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = result.map(product => `
        <tr>
            <td>${product.productId}</td>
            <td>${product.productName}</td>
            <td>${money(product.importPrice)}</td>
            <td>${product.profitRate || 0}%</td>
            <td>${money(product.salePrice)}</td>
            <td>
                <button class="btn btn-small"
                    onclick="openPriceForm('${product.productId}')">
                    Sửa
                </button>
            </td>
        </tr>
    `).join("");
}

function openPriceForm(id) {
    const products = getData("products");

    const product = products.find(
        item => item.productId === id
    );

    if (!product) {
        return;
    }

    document.getElementById("priceProductId").value =
        product.productId;

    document.getElementById("priceProductName").value =
        product.productName;

    document.getElementById("priceImport").value =
        product.importPrice;

    document.getElementById("priceProfit").value =
        product.profitRate || 30;

    calculatePrice();

    document.getElementById("priceModal").classList.add("show");
}

function closePriceForm() {
    document.getElementById("priceModal")?.classList.remove("show");
}

function calculatePrice() {
    const importPrice =
        Number(document.getElementById("priceImport")?.value || 0);

    const profit =
        Number(document.getElementById("priceProfit")?.value || 0);

    const salePrice =
        importPrice + importPrice * profit / 100;

    const result =
        document.getElementById("calculatedPrice");

    if (result) {
        result.textContent = money(Math.round(salePrice));
    }
}

function savePrice(event) {
    event.preventDefault();

    const products = getData("products");

    const id =
        document.getElementById("priceProductId").value;

    const importPrice =
        Number(document.getElementById("priceImport").value);

    const profitRate =
        Number(document.getElementById("priceProfit").value);

    const product = products.find(
        item => item.productId === id
    );

    if (!product) {
        return;
    }

    product.importPrice = importPrice;

    product.profitRate = profitRate;

    product.salePrice = Math.round(
        importPrice +
        importPrice * profitRate / 100
    );

    setData("products", products);

    closePriceForm();

    renderPrices();
}

/* Events */

document.addEventListener("DOMContentLoaded", () => {

    renderProducts();
    renderCategories();
    renderCustomers();
    renderOrders();
    renderImports();
    renderInventory();
    renderPrices();

    document
        .getElementById("categorySearch")
        ?.addEventListener("input", renderCategories);

    document
        .getElementById("productSearch")
        ?.addEventListener("input", renderProducts);

    document
        .getElementById("customerSearch")
        ?.addEventListener("input", renderCustomers);

    document
        .getElementById("inventorySearch")
        ?.addEventListener("input", renderInventory);

    document
        .getElementById("inventoryFilter")
        ?.addEventListener("change", renderInventory);

    document
        .getElementById("priceSearch")
        ?.addEventListener("input", renderPrices);

    document
        .getElementById("priceImport")
        ?.addEventListener("input", calculatePrice);

    document
        .getElementById("priceProfit")
        ?.addEventListener("input", calculatePrice);
});