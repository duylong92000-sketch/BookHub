const defaultCategories = [

    {
        categoryId: "DM001",
        categoryName: "Sách Trong Nước",
        status: "active"
    },

    {
        categoryId: "DM002",
        categoryName: "Sách Ngoại Văn",
        status: "active"
    },

    {
        categoryId: "DM003",
        categoryName: "Kinh Tế & Quản Trị",
        status: "active"
    },

    {
        categoryId: "DM004",
        categoryName: "Văn Học Nghệ Thuật",
        status: "active"
    },

    {
        categoryId: "DM005",
        categoryName: "Kỹ Năng Sống",
        status: "active"
    },

    {
        categoryId: "DM006",
        categoryName: "Sách Thiếu Nhi",
        status: "active"
    }

];


const defaultProducts = [

    {
        productId: "SP001",
        productName: "Đắc Nhân Tâm",
        categoryId: "DM005",
        author: "Dale Carnegie",
        publisher: "NXB Tổng Hợp TP.HCM",
        isbn: "978604000001",
        image: "dac-nhan-tam.jpg",
        description: "Một trong những cuốn sách nổi tiếng về kỹ năng sống.",
        importPrice: 50000,
        profitRate: 30,
        salePrice: 65000,
        stockQuantity: 20,
        status: "active"
    },

    {
        productId: "SP002",
        productName: "Nhà Giả Kim",
        categoryId: "DM004",
        author: "Paulo Coelho",
        publisher: "NXB Văn Học",
        isbn: "978604000002",
        image: "nha-gia-kim.jpg",
        description: "Tiểu thuyết nổi tiếng của Paulo Coelho.",
        importPrice: 60000,
        profitRate: 30,
        salePrice: 78000,
        stockQuantity: 15,
        status: "active"
    },

    {
        productId: "SP003",
        productName: "Cha Giàu Cha Nghèo",
        categoryId: "DM003",
        author: "Robert Kiyosaki",
        publisher: "NXB Trẻ",
        isbn: "978604000003",
        image: "cha-giau-cha-ngheo.jpg",
        description: "Sách về tư duy tài chính.",
        importPrice: 70000,
        profitRate: 30,
        salePrice: 91000,
        stockQuantity: 12,
        status: "active"
    }

];



/*KHỞI TẠO LOCAL STORAGE */

function initializeData() {

    if (!localStorage.getItem("categories")) {

        localStorage.setItem(
            "categories",
            JSON.stringify(defaultCategories)
        );

    }


    if (!localStorage.getItem("products")) {

        localStorage.setItem(
            "products",
            JSON.stringify(defaultProducts)
        );

    }


    if (!localStorage.getItem("customers")) {

        localStorage.setItem(
            "customers",
            JSON.stringify([])
        );

    }


    if (!localStorage.getItem("orders")) {

        localStorage.setItem(
            "orders",
            JSON.stringify([])
        );

    }

}


initializeData();



/*LẤY DỮ LIỆU */

function getProducts() {

    return JSON.parse(
        localStorage.getItem("products")
    ) || [];

}


function getCategories() {

    return JSON.parse(
        localStorage.getItem("categories")
    ) || [];

}


function getCustomers() {

    return JSON.parse(
        localStorage.getItem("customers")
    ) || [];

}


function getOrders() {

    return JSON.parse(
        localStorage.getItem("orders")
    ) || [];

}



/*DASHBOARD */

function loadDashboard() {

    const products = getProducts();

    const categories = getCategories();

    const customers = getCustomers();

    const orders = getOrders();


    const totalProducts =
        document.getElementById("totalProducts");


    const totalCategories =
        document.getElementById("totalCategories");


    const totalCustomers =
        document.getElementById("totalCustomers");


    const totalOrders =
        document.getElementById("totalOrders");


    const totalRevenue =
        document.getElementById("totalRevenue");


    const pendingOrders =
        document.getElementById("pendingOrders");


    if (!totalProducts) {

        return;

    }


    totalProducts.textContent =
        products.length;


    totalCategories.textContent =
        categories.length;


    totalCustomers.textContent =
        customers.length;


    totalOrders.textContent =
        orders.length;



    /*DOANH THU */

    let revenue = 0;


    orders.forEach(order => {

        if (
            order.orderStatus !== "cancelled"
        ) {

            revenue += Number(
                order.totalAmount || 0
            );

        }

    });


    totalRevenue.textContent =
        revenue.toLocaleString("vi-VN")
        + " VNĐ";



    /*ĐƠN CHỜ XỬ LÝ */

    const pending =
        orders.filter(
            order =>
                order.orderStatus === "pending"
        ).length;


    pendingOrders.textContent =
        pending;



    /* =========================
       ĐƠN HÀNG GẦN ĐÂY
    ========================= */

    renderRecentOrders(orders);

}



/*HIỂN THỊ ĐƠN HÀNG */

function renderRecentOrders(orders) {

    const table =
        document.getElementById("recentOrders");


    if (!table) {

        return;

    }


    table.innerHTML = "";


    const recentOrders =
        [...orders].reverse().slice(0, 5);


    recentOrders.forEach(order => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${order.orderId}
            </td>

            <td>
                ${order.customerId}
            </td>

            <td>
                ${order.orderDate}
            </td>

            <td>
                ${Number(
                    order.totalAmount || 0
                ).toLocaleString("vi-VN")}
                VNĐ
            </td>

            <td>
                ${getOrderStatusText(
                    order.orderStatus
                )}
            </td>

        `;


        table.appendChild(row);

    });


}



/*TRẠNG THÁI ĐƠN HÀNG */

function getOrderStatusText(status) {

    const statusMap = {

        pending: "Chờ xử lý",

        processing: "Đang xử lý",

        delivered: "Đã giao",

        cancelled: "Đã hủy"

    };


    return statusMap[status] || status;

}



/*PRODUCT */

function loadProductPage() {

    const table =
        document.getElementById(
            "productTableBody"
        );


    if (!table) {

        return;

    }


    loadCategoryOptions();

    renderProducts();


    const search =
        document.getElementById(
            "searchProduct"
        );


    const filter =
        document.getElementById(
            "filterCategory"
        );


    search.addEventListener(
        "input",
        renderProducts
    );


    filter.addEventListener(
        "change",
        renderProducts
    );


    const importPrice =
        document.getElementById(
            "importPrice"
        );


    const profitRate =
        document.getElementById(
            "profitRate"
        );


    importPrice.addEventListener(
        "input",
        calculateSalePrice
    );


    profitRate.addEventListener(
        "input",
        calculateSalePrice
    );

}



/*CATEGORY SELECT */

function loadCategoryOptions() {

    const categories =
        getCategories();


    const categorySelect =
        document.getElementById(
            "categoryId"
        );


    const filterSelect =
        document.getElementById(
            "filterCategory"
        );


    if (categorySelect) {

        categorySelect.innerHTML = "";

        categories.forEach(category => {

            categorySelect.innerHTML += `

                <option value="${category.categoryId}">

                    ${category.categoryName}

                </option>

            `;

        });

    }


    if (filterSelect) {

        filterSelect.innerHTML = `

            <option value="">
                Tất cả danh mục
            </option>

        `;


        categories.forEach(category => {

            filterSelect.innerHTML += `

                <option value="${category.categoryId}">

                    ${category.categoryName}

                </option>

            `;

        });

    }

}



/*HIỂN THỊ PRODUCTS */

function renderProducts() {

    const table =
        document.getElementById(
            "productTableBody"
        );


    if (!table) {

        return;

    }


    const products =
        getProducts();


    const search =
        document.getElementById(
            "searchProduct"
        ).value.toLowerCase();


    const category =
        document.getElementById(
            "filterCategory"
        ).value;


    const filteredProducts =
        products.filter(product => {

            const matchName =
                product.productName
                    .toLowerCase()
                    .includes(search);


            const matchCategory =
                category === ""
                ||
                product.categoryId === category;


            return matchName &&
                   matchCategory;

        });


    table.innerHTML = "";


    filteredProducts.forEach(product => {

        const row =
            document.createElement("tr");


        const categoryName =
            getCategoryName(
                product.categoryId
            );


        row.innerHTML = `

            <td>
                ${product.productId}
            </td>


            <td>

                <img
                    src="../images/${product.image}"
                    class="product-image"
                    alt="${product.productName}"
                >

            </td>


            <td>
                ${product.productName}
            </td>


            <td>
                ${categoryName}
            </td>


            <td>
                ${Number(
                    product.importPrice
                ).toLocaleString("vi-VN")}
                VNĐ
            </td>


            <td>
                ${product.profitRate}%
            </td>


            <td>
                ${Number(
                    product.salePrice
                ).toLocaleString("vi-VN")}
                VNĐ
            </td>


            <td>
                ${product.stockQuantity}
            </td>


            <td>

                <span class="${
                    product.status === "active"
                    ? "status-active"
                    : "status-inactive"
                }">

                    ${
                        product.status === "active"
                        ? "Đang bán"
                        : "Ngừng bán"
                    }

                </span>

            </td>


            <td>

                <button
                    class="btn btn-edit"
                    onclick="editProduct('${product.productId}')">

                    Sửa

                </button>


                <button
                    class="btn btn-delete"
                    onclick="deleteProduct('${product.productId}')">

                    Xóa

                </button>

            </td>

        `;


        table.appendChild(row);

    });

}



/*TÊN CATEGORY */

function getCategoryName(categoryId) {

    const categories =
        getCategories();


    const category =
        categories.find(
            item =>
                item.categoryId === categoryId
        );


    return category
        ? category.categoryName
        : "Không xác định";

}



/*TÍNH GIÁ BÁN */

function calculateSalePrice() {

    const importPrice =
        Number(
            document.getElementById(
                "importPrice"
            ).value
        );


    const profitRate =
        Number(
            document.getElementById(
                "profitRate"
            ).value
        );


    const salePrice =
        importPrice +
        importPrice * profitRate / 100;


    document.getElementById(
        "salePrice"
    ).value = Math.round(salePrice);

}



/*MỞ FORM */

function openProductForm() {

    document.getElementById(
        "productModal"
    ).classList.add("show");


    document.getElementById(
        "formTitle"
    ).textContent =
        "Thêm sản phẩm";


    document.getElementById(
        "productForm"
    ).reset();


    document.getElementById(
        "productId"
    ).value = "";


    loadCategoryOptions();

}



/*ĐÓNG FORM*/

function closeProductForm() {

    document.getElementById(
        "productModal"
    ).classList.remove("show");

}



/*LƯU PRODUCT*/

function saveProduct(event) {

    event.preventDefault();


    const products =
        getProducts();


    const productId =
        document.getElementById(
            "productId"
        ).value;


    const product = {

        productId:
            productId ||
            generateProductId(products),

        productName:
            document.getElementById(
                "productName"
            ).value.trim(),

        categoryId:
            document.getElementById(
                "categoryId"
            ).value,

        author:
            document.getElementById(
                "author"
            ).value.trim(),

        publisher:
            document.getElementById(
                "publisher"
            ).value.trim(),

        isbn:
            document.getElementById(
                "isbn"
            ).value.trim(),

        image:
            document.getElementById(
                "image"
            ).value.trim(),

        description:
            document.getElementById(
                "description"
            ).value.trim(),

        importPrice:
            Number(
                document.getElementById(
                    "importPrice"
                ).value
            ),

        profitRate:
            Number(
                document.getElementById(
                    "profitRate"
                ).value
            ),

        salePrice:
            Number(
                document.getElementById(
                    "salePrice"
                ).value
            ),

        stockQuantity:
            Number(
                document.getElementById(
                    "stockQuantity"
                ).value
            ),

        status:
            document.getElementById(
                "status"
            ).value

    };



    /*EDIT */

    if (productId) {

        const index =
            products.findIndex(
                item =>
                    item.productId === productId
            );


        if (index !== -1) {

            products[index] = product;

        }

    }


    /* ADD */

    else {

        products.push(product);

    }



    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );


    closeProductForm();

    renderProducts();


    alert(
        "Lưu sản phẩm thành công!"
    );

}



/*GENERATE PRODUCT ID */

function generateProductId(products) {

    let maxId = 0;


    products.forEach(product => {

        const number =
            parseInt(
                product.productId
                    .replace("SP", "")
            );


        if (number > maxId) {

            maxId = number;

        }

    });


    return "SP" +
        String(maxId + 1)
            .padStart(3, "0");

}



/*EDIT PRODUCT*/

function editProduct(productId) {

    const products =
        getProducts();


    const product =
        products.find(
            item =>
                item.productId === productId
        );


    if (!product) {

        return;

    }


    openProductForm();


    document.getElementById(
        "formTitle"
    ).textContent =
        "Chỉnh sửa sản phẩm";


    document.getElementById(
        "productId"
    ).value =
        product.productId;


    document.getElementById(
        "productName"
    ).value =
        product.productName;


    document.getElementById(
        "categoryId"
    ).value =
        product.categoryId;


    document.getElementById(
        "author"
    ).value =
        product.author;


    document.getElementById(
        "publisher"
    ).value =
        product.publisher;


    document.getElementById(
        "isbn"
    ).value =
        product.isbn;


    document.getElementById(
        "image"
    ).value =
        product.image;


    document.getElementById(
        "description"
    ).value =
        product.description;


    document.getElementById(
        "importPrice"
    ).value =
        product.importPrice;


    document.getElementById(
        "profitRate"
    ).value =
        product.profitRate;


    document.getElementById(
        "salePrice"
    ).value =
        product.salePrice;


    document.getElementById(
        "stockQuantity"
    ).value =
        product.stockQuantity;


    document.getElementById(
        "status"
    ).value =
        product.status;

}



/*DELETE PRODUCT*/

function deleteProduct(productId) {

    const confirmDelete =
        confirm(
            "Bạn có chắc muốn xóa sản phẩm này?"
        );


    if (!confirmDelete) {

        return;

    }


    let products =
        getProducts();


    products =
        products.filter(
            product =>
                product.productId !== productId
        );


    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );


    renderProducts();

    alert(
        "Đã xóa sản phẩm!"
    );

}



/* CHẠY KHI LOAD PAGE*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDashboard();

        loadProductPage();

    }
);

/* =====================================================
   PRODUCTS
===================================================== */

function getProductsExtra() {

    return JSON.parse(
        localStorage.getItem("products")
    ) || [];

}


function setProductsExtra(products) {

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

}



/* =====================================================
   CATEGORIES
===================================================== */

function getCategoriesExtra() {

    return JSON.parse(
        localStorage.getItem("categories")
    ) || [];

}


function setCategoriesExtra(categories) {

    localStorage.setItem(
        "categories",
        JSON.stringify(categories)
    );

}



/* =====================================================
   IMPORTS
===================================================== */

function getImportsExtra() {

    return JSON.parse(
        localStorage.getItem("imports")
    ) || [];

}


function setImportsExtra(imports) {

    localStorage.setItem(
        "imports",
        JSON.stringify(imports)
    );

}



/* =====================================================
   FORMAT MONEY
===================================================== */

function money(value) {

    return Number(value || 0)
        .toLocaleString("vi-VN")
        + " VNĐ";

}



/* =====================================================
   CATEGORY NAME
===================================================== */

function categoryNameExtra(categoryId) {

    const categories =
        getCategoriesExtra();


    const category =
        categories.find(
            category =>
                category.categoryId === categoryId
        );


    return category
        ? category.categoryName
        : "Không xác định";

}



/* =====================================================
   CATEGORY
===================================================== */

function renderCategories() {

    const table =
        document.getElementById(
            "categoryTableBody"
        );


    if (!table) return;


    const keyword =
        (
            document.getElementById(
                "searchCategory"
            )?.value || ""
        ).toLowerCase();


    const products =
        getProductsExtra();


    const categories =
        getCategoriesExtra().filter(
            category =>
                category.categoryName
                    .toLowerCase()
                    .includes(keyword)
        );


    table.innerHTML = "";


    categories.forEach(category => {

        const count =
            products.filter(
                product =>
                    product.categoryId ===
                    category.categoryId
            ).length;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${category.categoryId}
            </td>

            <td>
                ${category.categoryName}
            </td>

            <td>
                ${count}
            </td>

            <td>

                <span class="${
                    category.status === "active"
                    ? "status-active"
                    : "status-inactive"
                }">

                    ${
                        category.status === "active"
                        ? "Đang hoạt động"
                        : "Ngừng hoạt động"
                    }

                </span>

            </td>

            <td>

                <button
                    class="btn btn-edit"
                    onclick="editCategory(
                        '${category.categoryId}'
                    )">

                    Sửa

                </button>


                <button
                    class="btn btn-delete"
                    onclick="deleteCategory(
                        '${category.categoryId}'
                    )">

                    Xóa

                </button>

            </td>

        `;


        table.appendChild(row);

    });

}



/* =====================================================
   OPEN CATEGORY FORM
===================================================== */

function openCategoryForm() {

    document.getElementById(
        "categoryModal"
    ).classList.add("show");


    document.getElementById(
        "categoryForm"
    ).reset();


    document.getElementById(
        "categoryId"
    ).value = "";


    document.getElementById(
        "categoryFormTitle"
    ).textContent =
        "Thêm danh mục";

}



/* =====================================================
   CLOSE CATEGORY FORM
===================================================== */

function closeCategoryForm() {

    document.getElementById(
        "categoryModal"
    ).classList.remove("show");

}



/* =====================================================
   GENERATE CATEGORY ID
===================================================== */

function generateCategoryId() {

    const categories =
        getCategoriesExtra();


    let maxId = 0;


    categories.forEach(category => {

        const number =
            parseInt(
                category.categoryId
                    .replace("DM", "")
            );


        if (number > maxId) {

            maxId = number;

        }

    });


    return "DM" +
        String(maxId + 1)
            .padStart(3, "0");

}



/* =====================================================
   SAVE CATEGORY
===================================================== */

function saveCategory(event) {

    event.preventDefault();


    const categories =
        getCategoriesExtra();


    const categoryId =
        document.getElementById(
            "categoryId"
        ).value;


    const categoryName =
        document.getElementById(
            "categoryName"
        ).value.trim();


    const status =
        document.getElementById(
            "categoryStatus"
        ).value;



    if (categoryId) {

        const index =
            categories.findIndex(
                category =>
                    category.categoryId ===
                    categoryId
            );


        if (index !== -1) {

            categories[index].categoryName =
                categoryName;

            categories[index].status =
                status;

        }

    }

    else {

        categories.push({

            categoryId:
                generateCategoryId(),

            categoryName:
                categoryName,

            status:
                status

        });

    }


    setCategoriesExtra(categories);


    closeCategoryForm();


    renderCategories();

}



/* =====================================================
   EDIT CATEGORY
===================================================== */

function editCategory(categoryId) {

    const category =
        getCategoriesExtra().find(
            item =>
                item.categoryId ===
                categoryId
        );


    if (!category) return;


    openCategoryForm();


    document.getElementById(
        "categoryFormTitle"
    ).textContent =
        "Chỉnh sửa danh mục";


    document.getElementById(
        "categoryId"
    ).value =
        category.categoryId;


    document.getElementById(
        "categoryName"
    ).value =
        category.categoryName;


    document.getElementById(
        "categoryStatus"
    ).value =
        category.status;

}



/* =====================================================
   DELETE CATEGORY
===================================================== */

function deleteCategory(categoryId) {

    const products =
        getProductsExtra();


    const hasProducts =
        products.some(
            product =>
                product.categoryId ===
                categoryId
        );


    if (hasProducts) {

        alert(
            "Không thể xóa danh mục vì vẫn còn sản phẩm thuộc danh mục này."
        );

        return;

    }


    if (
        !confirm(
            "Bạn có chắc muốn xóa danh mục này?"
        )
    ) {

        return;

    }


    const categories =
        getCategoriesExtra().filter(
            category =>
                category.categoryId !==
                categoryId
        );


    setCategoriesExtra(categories);


    renderCategories();

}



/* =====================================================
   IMPORT
===================================================== */

function renderImports() {

    const table =
        document.getElementById(
            "importTableBody"
        );


    if (!table) return;


    const filterDate =
        document.getElementById(
            "importDate"
        )?.value || "";


    const imports =
        getImportsExtra().filter(
            item =>
                !filterDate ||
                item.importDate === filterDate
        );


    table.innerHTML = "";


    imports
        .slice()
        .reverse()
        .forEach(item => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${item.importId}
                </td>

                <td>
                    ${item.importDate}
                </td>

                <td>
                    ${item.items.length}
                </td>

                <td>
                    ${money(item.totalAmount)}
                </td>

                <td>
                    ${
                        item.status === "completed"
                        ? "Đã hoàn thành"
                        : "Đã hủy"
                    }
                </td>

                <td>

                    <button
                        class="btn btn-delete"
                        onclick="deleteImport(
                            '${item.importId}'
                        )">

                        Xóa

                    </button>

                </td>

            `;


            table.appendChild(row);

        });

}



/* =====================================================
   OPEN IMPORT FORM
===================================================== */

function openImportForm() {

    const products =
        getProductsExtra();


    if (products.length === 0) {

        alert(
            "Chưa có sản phẩm để nhập hàng."
        );

        return;

    }


    const select =
        document.getElementById(
            "importProductId"
        );


    select.innerHTML = "";


    products.forEach(product => {

        select.innerHTML += `

            <option
                value="${product.productId}">

                ${product.productId}
                -
                ${product.productName}

            </option>

        `;

    });


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById(
        "newImportDate"
    ).value = today;


    document.getElementById(
        "importQuantity"
    ).value = 1;


    document.getElementById(
        "newImportPrice"
    ).value =
        products[0].importPrice || 0;


    select.onchange = function () {

        const product =
            products.find(
                item =>
                    item.productId ===
                    select.value
            );


        if (product) {

            document.getElementById(
                "newImportPrice"
            ).value =
                product.importPrice || 0;

        }

    };


    document.getElementById(
        "importModal"
    ).classList.add("show");

}



/* =====================================================
   CLOSE IMPORT FORM
===================================================== */

function closeImportForm() {

    document.getElementById(
        "importModal"
    ).classList.remove("show");

}



/* =====================================================
   GENERATE IMPORT ID
===================================================== */

function generateImportId() {

    const imports =
        getImportsExtra();


    let maxId = 0;


    imports.forEach(item => {

        const number =
            parseInt(
                item.importId
                    .replace("PN", "")
            );


        if (number > maxId) {

            maxId = number;

        }

    });


    return "PN" +
        String(maxId + 1)
            .padStart(3, "0");

}



/* =====================================================
   SAVE IMPORT
===================================================== */

function saveImport(event) {

    event.preventDefault();


    const products =
        getProductsExtra();


    const imports =
        getImportsExtra();


    const productId =
        document.getElementById(
            "importProductId"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "importQuantity"
            ).value
        );


    const importPrice =
        Number(
            document.getElementById(
                "newImportPrice"
            ).value
        );


    const importDate =
        document.getElementById(
            "newImportDate"
        ).value;


    const product =
        products.find(
            item =>
                item.productId ===
                productId
        );


    if (!product) {

        alert(
            "Không tìm thấy sản phẩm."
        );

        return;

    }


    const subtotal =
        quantity * importPrice;


    const newImport = {

        importId:
            generateImportId(),

        importDate:
            importDate,

        items: [

            {

                productId:
                    productId,

                quantity:
                    quantity,

                importPrice:
                    importPrice,

                subtotal:
                    subtotal

            }

        ],

        totalAmount:
            subtotal,

        status:
            "completed"

    };


    imports.push(newImport);



    /* CẬP NHẬT TỒN KHO */

    product.stockQuantity =
        Number(
            product.stockQuantity || 0
        ) + quantity;



    /* CẬP NHẬT GIÁ NHẬP */

    product.importPrice =
        importPrice;



    /* TÍNH LẠI GIÁ BÁN */

    product.salePrice =
        Math.round(
            importPrice +
            importPrice *
            Number(product.profitRate || 0)
            / 100
        );



    setProductsExtra(products);

    setImportsExtra(imports);


    closeImportForm();

    renderImports();


    alert(
        "Tạo phiếu nhập thành công!"
    );

}



/* =====================================================
   DELETE IMPORT
===================================================== */

function deleteImport(importId) {

    if (
        !confirm(
            "Bạn có chắc muốn xóa phiếu nhập này?"
        )
    ) {

        return;

    }


    const imports =
        getImportsExtra().filter(
            item =>
                item.importId !==
                importId
        );


    setImportsExtra(imports);


    renderImports();

}



/* =====================================================
   INVENTORY
===================================================== */

function renderInventory() {

    const table =
        document.getElementById(
            "inventoryTableBody"
        );


    if (!table) return;


    const products =
        getProductsExtra();


    const keyword =
        (
            document.getElementById(
                "searchInventory"
            )?.value || ""
        ).toLowerCase();


    const filter =
        document.getElementById(
            "inventoryFilter"
        )?.value || "";



    const filtered =
        products.filter(product => {

            const matchName =

                product.productName
                    .toLowerCase()
                    .includes(keyword)

                ||

                product.productId
                    .toLowerCase()
                    .includes(keyword);



            const stock =
                Number(
                    product.stockQuantity || 0
                );


            let matchStock = true;


            if (filter === "low") {

                matchStock =
                    stock > 0 &&
                    stock <= 5;

            }


            if (filter === "out") {

                matchStock =
                    stock === 0;

            }


            if (filter === "available") {

                matchStock =
                    stock > 0;

            }


            return (
                matchName &&
                matchStock
            );

        });



    table.innerHTML = "";



    filtered.forEach(product => {

        const stock =
            Number(
                product.stockQuantity || 0
            );


        const inventoryValue =
            stock *
            Number(
                product.importPrice || 0
            );


        let status =
            "Còn hàng";


        if (stock === 0) {

            status =
                "Hết hàng";

        }

        else if (stock <= 5) {

            status =
                "Sắp hết hàng";

        }



        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${product.productId}
            </td>

            <td>
                ${product.productName}
            </td>

            <td>
                ${categoryNameExtra(
                    product.categoryId
                )}
            </td>

            <td>
                ${stock}
            </td>

            <td>
                ${money(
                    product.importPrice
                )}
            </td>

            <td>
                ${money(
                    inventoryValue
                )}
            </td>

            <td>

                <span class="${
                    stock === 0
                    ? "status-inactive"
                    : stock <= 5
                    ? "status-low"
                    : "status-active"
                }">

                    ${status}

                </span>

            </td>

        `;


        table.appendChild(row);

    });

}



/* =====================================================
   PRICES
===================================================== */

function renderPrices() {

    const table =
        document.getElementById(
            "priceTableBody"
        );


    if (!table) return;


    const keyword =
        (
            document.getElementById(
                "searchPrice"
            )?.value || ""
        ).toLowerCase();


    const products =
        getProductsExtra().filter(
            product =>

                product.productName
                    .toLowerCase()
                    .includes(keyword)

                ||

                product.productId
                    .toLowerCase()
                    .includes(keyword)

        );


    table.innerHTML = "";


    products.forEach(product => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${product.productId}
            </td>

            <td>
                ${product.productName}
            </td>

            <td>
                ${money(
                    product.importPrice
                )}
            </td>

            <td>
                ${product.profitRate}%
            </td>

            <td>
                ${money(
                    product.salePrice
                )}
            </td>

            <td>

                <button
                    class="btn btn-edit"
                    onclick="openPriceForm(
                        '${product.productId}'
                    )">

                    Sửa giá

                </button>

            </td>

        `;


        table.appendChild(row);

    });

}



/* =====================================================
   OPEN PRICE FORM
===================================================== */

function openPriceForm(productId) {

    const product =
        getProductsExtra().find(
            item =>
                item.productId ===
                productId
        );


    if (!product) return;


    document.getElementById(
        "priceProductId"
    ).value =
        product.productId;


    document.getElementById(
        "priceProductName"
    ).value =
        product.productName;


    document.getElementById(
        "priceImport"
    ).value =
        product.importPrice;


    document.getElementById(
        "priceProfit"
    ).value =
        product.profitRate;


    calculatePrice();


    document.getElementById(
        "priceModal"
    ).classList.add("show");

}



/* =====================================================
   CLOSE PRICE FORM
===================================================== */

function closePriceForm() {

    document.getElementById(
        "priceModal"
    ).classList.remove("show");

}



/* =====================================================
   CALCULATE PRICE
===================================================== */

function calculatePrice() {

    const importPrice =
        Number(
            document.getElementById(
                "priceImport"
            ).value || 0
        );


    const profit =
        Number(
            document.getElementById(
                "priceProfit"
            ).value || 0
        );


    const sale =
        importPrice +
        importPrice * profit / 100;


    document.getElementById(
        "priceSale"
    ).value =
        Math.round(sale);

}



/* =====================================================
   SAVE PRICE
===================================================== */

function savePrice(event) {

    event.preventDefault();


    const productId =
        document.getElementById(
            "priceProductId"
        ).value;


    const importPrice =
        Number(
            document.getElementById(
                "priceImport"
            ).value
        );


    const profitRate =
        Number(
            document.getElementById(
                "priceProfit"
            ).value
        );


    const products =
        getProductsExtra();


    const product =
        products.find(
            item =>
                item.productId ===
                productId
        );


    if (!product) return;


    product.importPrice =
        importPrice;


    product.profitRate =
        profitRate;


    product.salePrice =
        Math.round(
            importPrice +
            importPrice *
            profitRate /
            100
        );


    setProductsExtra(products);


    closePriceForm();


    renderPrices();


    alert(
        "Cập nhật giá thành công!"
    );

}



/* =====================================================
   CHẠY KHI LOAD TRANG
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderCategories();

        renderImports();

        renderInventory();

        renderPrices();



        const searchCategory =
            document.getElementById(
                "searchCategory"
            );


        if (searchCategory) {

            searchCategory.addEventListener(
                "input",
                renderCategories
            );

        }



        const importDate =
            document.getElementById(
                "importDate"
            );


        if (importDate) {

            importDate.addEventListener(
                "change",
                renderImports
            );

        }



        const searchInventory =
            document.getElementById(
                "searchInventory"
            );


        if (searchInventory) {

            searchInventory.addEventListener(
                "input",
                renderInventory
            );

        }



        const inventoryFilter =
            document.getElementById(
                "inventoryFilter"
            );


        if (inventoryFilter) {

            inventoryFilter.addEventListener(
                "change",
                renderInventory
            );

        }



        const searchPrice =
            document.getElementById(
                "searchPrice"
            );


        if (searchPrice) {

            searchPrice.addEventListener(
                "input",
                renderPrices
            );

        }



        const priceImport =
            document.getElementById(
                "priceImport"
            );


        const priceProfit =
            document.getElementById(
                "priceProfit"
            );


        if (priceImport) {

            priceImport.addEventListener(
                "input",
                calculatePrice
            );

        }


        if (priceProfit) {

            priceProfit.addEventListener(
                "input",
                calculatePrice
            );

        }

    }
);