/* ==========================================================
   BOOKHUB - data.js
   Dữ liệu và hàm dùng chung cho admin.js và products.js.
   PHẢI nạp file này TRƯỚC admin.js / products.js.

   Quy ước localStorage (nguồn dữ liệu duy nhất):
     categories : [{ categoryId, key, categoryName, status }]
     products   : [{ productId, productName, categoryId, author, publisher,
                     importPrice, profitRate, salePrice, stockQuantity,
                     description, image, coverType, year, pages, status }]
     customers  : []
     orders     : [{ orderId, customerId, orderDate, items:[{productId, quantity, price}],
                     totalAmount, orderStatus }]
     imports    : [{ importId, importDate, items, totalAmount, status }]
     cart       : { "MS001": 2 }   (do trang khách quản lý)
   ========================================================== */

const getData = key => {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        return [];
    }
};

const setData = (key, data) =>
    localStorage.setItem(key, JSON.stringify(data));


/* ==================== DỮ LIỆU MẪU ==================== */
/* Chỉ được nạp khi localStorage chưa có dữ liệu tương ứng. */

const CATEGORY_SEED = [
    { categoryId: "DM001", key: "vanhoc",   categoryName: "Văn học & Tiểu thuyết", status: "active" },
    { categoryId: "DM002", key: "kinhte",   categoryName: "Kinh tế & Quản trị",    status: "active" },
    { categoryId: "DM003", key: "cntt",     categoryName: "Công nghệ thông tin",   status: "active" },
    { categoryId: "DM004", key: "thieunhi", categoryName: "Sách thiếu nhi",        status: "active" }
];

// Lưu ý: tên là SEED_BOOKS (không phải BOOK_LIST) để không trùng với products.js cũ.
// category ở đây là "key" của danh mục (vanhoc, kinhte, cntt, thieunhi).
const SEED_BOOKS = [
    // ----- Văn học & Tiểu thuyết -----
    { sku: "MS001", title: "Chí Phèo", author: "Nam Cao", category: "vanhoc", image: "chi-pheo.jpg",
      price: 55000, coverType: "Bìa mềm", publisher: "NXB Văn Học", year: 2018, pages: 120, stock: 30,
      desc: "Truyện ngắn nổi tiếng của Nam Cao về số phận bi kịch của người nông dân bị đẩy vào con đường tha hóa trong xã hội cũ." },
    { sku: "MS002", title: "Hạ Đỏ", author: "Nguyễn Nhật Ánh", category: "vanhoc", image: "ha-do.jpg",
      price: 95000, coverType: "Bìa mềm", publisher: "NXB Trẻ", year: 2019, pages: 260, stock: 18,
      desc: "Tác phẩm của nhà văn Nguyễn Nhật Ánh với lối viết giản dị, giàu cảm xúc." },
    { sku: "MS003", title: "Đất Rừng Phương Nam", author: "Đoàn Giỏi", category: "vanhoc", image: "dat-rung-phuong-nam.jpg",
      price: 110000, coverType: "Bìa cứng", publisher: "NXB Kim Đồng", year: 2020, pages: 380, stock: 0,
      desc: "Tiểu thuyết của Đoàn Giỏi kể về những ngày phiêu bạt của cậu bé An trên vùng sông nước Nam Bộ." },
    { sku: "MS004", title: "Mắt Biếc", author: "Nguyễn Nhật Ánh", category: "vanhoc", image: "matbiec.jpg",
      price: 100000, coverType: "Bìa mềm", publisher: "NXB Trẻ", year: 2020, pages: 300, stock: 26,
      desc: "Tác phẩm xúc động viết về mối tình thầm lặng của chàng trai làng Đo Đo tên Ngạn dành cho cô bạn thân Hà Lan với đôi mắt biếc vương vấn cả một đời." },

    // ----- Kinh tế & Quản trị -----
    { sku: "MS005", title: "Quản Trị Hiệu Suất Cao", author: "Andrew S. Grove", category: "kinhte", image: "quantri-hieusuatcao.jpg",
      price: 140000, coverType: "Bìa mềm", publisher: "NXB Thế Giới", year: 2021, pages: 320, stock: 12,
      desc: "Cuốn sách về cách nâng cao hiệu suất làm việc của cá nhân và đội nhóm, từ kinh nghiệm quản lý của tác giả." },
    { sku: "MS006", title: "12 Nguyên Tắc Quản Trị Kinh Doanh Của Inamori", author: "Inamori Kazuo", category: "kinhte", image: "12-nguyentac-qtkd.jpg",
      price: 120000, coverType: "Bìa mềm", publisher: "NXB Lao Động", year: 2022, pages: 280, stock: 20,
      desc: "Trình bày các nguyên tắc quản trị kinh doanh mà Inamori Kazuo đúc kết từ kinh nghiệm điều hành doanh nghiệp." },
    { sku: "MS007", title: "Người Giàu Nhất Thành Babylon", author: "George S. Clason", category: "kinhte", image: "nguoi-giau-nhat-thanh-babylon.jpg",
      price: 85000, coverType: "Bìa mềm", publisher: "NXB Thanh Niên", year: 2019, pages: 200, stock: 35,
      desc: "Những câu chuyện ngụ ngôn về cách quản lý tiền bạc và xây dựng tài sản." },
    { sku: "MS008", title: "Đắc Nhân Tâm", author: "Dale Carnegie", category: "kinhte", image: "dac-nhan-tam.jpg",
      price: 90000, coverType: "Bìa mềm", publisher: "NXB Tổng Hợp", year: 2020, pages: 320, stock: 40,
      desc: "Cuốn sách kinh điển về nghệ thuật giao tiếp, ứng xử và xây dựng các mối quan hệ." },

    // ----- Công nghệ thông tin -----
    { sku: "MS009", title: "Lập Trình Python Cho Người Mới Bắt Đầu", author: "Nguyễn Ngọc Tân", category: "cntt", image: "laptrinh-python-cho-nguoi-moi-bat-dau.jpg",
      price: 150000, coverType: "Bìa mềm", publisher: "NXB Thanh Niên", year: 2023, pages: 340, stock: 15,
      desc: "Giáo trình nhập môn lập trình Python dành cho người mới bắt đầu." },
    { sku: "MS010", title: "Sổ Tay \"Dân IT\" Lập Trình Web & Lập Trình Ứng Dụng", author: "Đào Xuân Hiệp", category: "cntt", image: "lap-trinh-web.jpg",
      price: 180000, coverType: "Bìa mềm", publisher: "NXB Thanh Niên", year: 2022, pages: 400, stock: 10,
      desc: "Sổ tay tổng hợp kiến thức và kỹ năng lập trình web và lập trình ứng dụng." },
    { sku: "MS011", title: "Database Management System", author: "Sotirios Zygiaris", category: "cntt", image: "database-management-system.jpg",
      price: 220000, coverType: "Bìa cứng", publisher: "NXB Khoa Học Kỹ Thuật", year: 2021, pages: 450, stock: 8,
      desc: "Tài liệu về các khái niệm và nguyên lý của hệ quản trị cơ sở dữ liệu." },

    // ----- Sách thiếu nhi -----
    { sku: "MS012", title: "Dế Mèn Phiêu Lưu Ký", author: "Tô Hoài", category: "thieunhi", image: "de-men-phieu-luu-ky.jpg",
      price: 75000, coverType: "Bìa cứng", publisher: "NXB Kim Đồng", year: 2019, pages: 160, stock: 22,
      desc: "Tác phẩm kinh điển của Tô Hoài kể về cuộc phiêu lưu của chú Dế Mèn." },
    { sku: "MS013", title: "Doraemon: Nobita Và Cuộc Phiêu Lưu Vào Thế Giới Trong Tranh", author: "Fujiko F. Fujio", category: "thieunhi", image: "doraemon.jpg",
      price: 25000, coverType: "Bìa mềm", publisher: "NXB Kim Đồng", year: 2020, pages: 190, stock: 50,
      desc: "Cuộc phiêu lưu của Nobita, Doraemon và các bạn trong thế giới trong tranh." },
    { sku: "MS014", title: "Hoàng Tử Rơm", author: "Nhiều tác giả", category: "thieunhi", image: "hoang-tu-rom.jpg",
      price: 45000, coverType: "Bìa mềm", publisher: "NXB Kim Đồng", year: 2021, pages: 48, stock: 14,
      desc: "Truyện thiếu nhi dành cho các bạn nhỏ." },
    { sku: "MS015", title: "Trí Khôn Của Ta Đây", author: "Truyện cổ tích Việt Nam", category: "thieunhi", image: "tri-khon-cua-ta-day.jpg",
      price: 30000, coverType: "Bìa mềm", publisher: "NXB Kim Đồng", year: 2018, pages: 32, stock: 25,
      desc: "Truyện cổ tích Việt Nam về trí khôn và sự thông minh." }
];

function seedData() {
    const currentCategories = getData("categories");

    if (localStorage.getItem("categories") === null) {
        setData("categories", CATEGORY_SEED);
    } else {
        const oldDefaultNames = [
            "Sách Trong Nước", "Sách Ngoại Văn", "Kinh Tế & Quản Trị",
            "Văn Học Nghệ Thuật", "Kỹ Năng Sống", "Sách Thiếu Nhi"
        ];
        const isOldDefault = c =>
            /^DM00[1-6]$/.test(c.categoryId || "") &&
            oldDefaultNames.some(name => name.toLowerCase() === (c.categoryName || "").toLowerCase());
        const customCategories = currentCategories.filter(c => !isOldDefault(c));
        const mergedCategories = [...CATEGORY_SEED];

        customCategories.forEach(c => {
            if (!mergedCategories.some(seed =>
                seed.categoryId === c.categoryId ||
                (seed.key && c.key && seed.key === c.key) ||
                seed.categoryName.toLowerCase() === (c.categoryName || "").toLowerCase()
            )) mergedCategories.push(c);
        });

        setData("categories", mergedCategories);
    }

    const PROFIT = 30;

    const initialProducts = SEED_BOOKS.map(b => ({
        productId: b.sku,
        productName: b.title,
        categoryId: CATEGORY_SEED.find(c => c.key === b.category).categoryId,
        author: b.author,
        publisher: b.publisher,
        importPrice: Math.round(b.price / (1 + PROFIT / 100)),
        profitRate: PROFIT,
        salePrice: b.price,
        stockQuantity: b.stock,
        description: b.desc,
        image: b.image,
        coverType: b.coverType,
        year: b.year,
        pages: b.pages,
        status: "active"
    }));

    if (localStorage.getItem("products") === null) {
        setData("products", initialProducts);
    } else {
        const savedProducts = getData("products");
        const missingProducts = initialProducts.filter(
            initial => !savedProducts.some(
                saved => saved.productId === initial.productId
            )
        );

        if (missingProducts.length > 0) {
            setData("products", [...savedProducts, ...missingProducts]);
        }
    }

    ["customers", "orders", "imports"].forEach(key => {
        if (localStorage.getItem(key) === null) setData(key, []);
    });
}