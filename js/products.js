/* ==========================================================
   BOOKHUB - products.js (một file JS duy nhất cho cả website)

   Mục lục:
     A. Dữ liệu & hàm dùng chung
     B. Trang chủ         -> initHome()
     C. Trang danh sách   -> initProducts()
     D. Trang chi tiết    -> initDetail()
     E. Khởi chạy theo thuộc tính <body data-page="...">
   ========================================================== */

/* ==========================================================
   A. DỮ LIỆU & HÀM DÙNG CHUNG
   ========================================================== */


const SITE_ROOT = new URL('../', document.currentScript.src).href;   // thư mục cha của js/
const PAGE_PRODUCTS = SITE_ROOT + 'customer/products.html';
const PAGE_DETAIL   = SITE_ROOT + 'customer/productdetail.html';
const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const formatPrice = (n) => n.toLocaleString('vi-VN') + ' đ';

// value của <option> trong products.html  ->  tên thể loại trong dữ liệu
const CATEGORY_MAP = {
    vanhoc:   'Văn học & Tiểu thuyết',
    kinhte:   'Kinh tế & Quản trị',
    cntt:     'Công nghệ thông tin',
    thieunhi: 'Sách thiếu nhi'
};

/* ----------------------------------------------------------
   DANH SÁCH SÁCH (15 cuốn)
   - image: chỉ ghi tên file, ảnh nằm trong images/books/
   - sku: không được trùng nhau (trang chi tiết tìm sách theo mã này)
   - category: dùng CATEGORY_MAP.<khóa> để luôn khớp với bộ lọc
   - stock: số cuốn trong kho (0 = hết hàng)
   - LƯU Ý: price, publisher, year, pages, stock, desc (trừ Mắt Biếc)
     là dữ liệu MẪU, hãy thay bằng thông tin thật của từng cuốn
   ---------------------------------------------------------- */
const BOOK_LIST = [
    // ----- Văn học & Tiểu thuyết -----
    { sku: 'MS001', title: 'Chí Phèo', author: 'Nam Cao', category: CATEGORY_MAP.vanhoc, image: 'chi-pheo.jpg',
      price: 55000, coverType: 'Bìa mềm', publisher: 'NXB Văn Học', year: 2018, pages: 120, stock: 30,
      desc: 'Truyện ngắn nổi tiếng của Nam Cao về số phận bi kịch của người nông dân bị đẩy vào con đường tha hóa trong xã hội cũ.' },
    { sku: 'MS002', title: 'Hạ Đỏ', author: 'Nguyễn Nhật Ánh', category: CATEGORY_MAP.vanhoc, image: 'ha-do.jpg',
      price: 95000, coverType: 'Bìa mềm', publisher: 'NXB Trẻ', year: 2019, pages: 260, stock: 18,
      desc: 'Tác phẩm của nhà văn Nguyễn Nhật Ánh với lối viết giản dị, giàu cảm xúc.' },
    { sku: 'MS003', title: 'Đất Rừng Phương Nam', author: 'Đoàn Giỏi', category: CATEGORY_MAP.vanhoc, image: 'dat-rung-phuong-nam.jpg',
      price: 110000, coverType: 'Bìa cứng', publisher: 'NXB Kim Đồng', year: 2020, pages: 380, stock: 0,
      desc: 'Tiểu thuyết của Đoàn Giỏi kể về những ngày phiêu bạt của cậu bé An trên vùng sông nước Nam Bộ.' },
    { sku: 'MS004', title: 'Mắt Biếc', author: 'Nguyễn Nhật Ánh', category: CATEGORY_MAP.vanhoc, image: 'matbiec.jpg',
      price: 100000, coverType: 'Bìa mềm', publisher: 'NXB Trẻ', year: 2020, pages: 300, stock: 26,
      desc: 'Tác phẩm xúc động viết về mối tình thầm lặng của chàng trai làng Đo Đo tên Ngạn dành cho cô bạn thân Hà Lan với đôi mắt biếc vương vấn cả một đời.' },

    // ----- Kinh tế & Quản trị -----
    { sku: 'MS005', title: 'Quản Trị Hiệu Suất Cao', author: 'Andrew S. Grove', category: CATEGORY_MAP.kinhte, image: 'quantri-hieusuatcao.jpg',
      price: 140000, coverType: 'Bìa mềm', publisher: 'NXB Thế Giới', year: 2021, pages: 320, stock: 12,
      desc: 'Cuốn sách về cách nâng cao hiệu suất làm việc của cá nhân và đội nhóm, từ kinh nghiệm quản lý của tác giả.' },
    { sku: 'MS006', title: '12 Nguyên Tắc Quản Trị Kinh Doanh Của Inamori', author: 'Inamori Kazuo', category: CATEGORY_MAP.kinhte, image: '12-nguyentac-qtkd.jpg',
      price: 120000, coverType: 'Bìa mềm', publisher: 'NXB Lao Động', year: 2022, pages: 280, stock: 20,
      desc: 'Trình bày các nguyên tắc quản trị kinh doanh mà Inamori Kazuo đúc kết từ kinh nghiệm điều hành doanh nghiệp.' },
    { sku: 'MS007', title: 'Người Giàu Nhất Thành Babylon', author: 'George S. Clason', category: CATEGORY_MAP.kinhte, image: 'nguoi-giau-nhat-thanh-babylon.jpg',
      price: 85000, coverType: 'Bìa mềm', publisher: 'NXB Thanh Niên', year: 2019, pages: 200, stock: 35,
      desc: 'Những câu chuyện ngụ ngôn về cách quản lý tiền bạc và xây dựng tài sản.' },
    { sku: 'MS008', title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', category: CATEGORY_MAP.kinhte, image: 'dac-nhan-tam.jpg',
      price: 90000, coverType: 'Bìa mềm', publisher: 'NXB Tổng Hợp', year: 2020, pages: 320, stock: 40,
      desc: 'Cuốn sách kinh điển về nghệ thuật giao tiếp, ứng xử và xây dựng các mối quan hệ.' },

    // ----- Công nghệ thông tin -----
    { sku: 'MS009', title: 'Lập Trình Python Cho Người Mới Bắt Đầu', author: 'Nguyễn Ngọc Tân', category: CATEGORY_MAP.cntt, image: 'laptrinh-python-cho-nguoi-moi-bat-dau.jpg',
      price: 150000, coverType: 'Bìa mềm', publisher: 'NXB Thanh Niên', year: 2023, pages: 340, stock: 15,
      desc: 'Giáo trình nhập môn lập trình Python dành cho người mới bắt đầu.' },
    { sku: 'MS010', title: 'Sổ Tay "Dân IT" Lập Trình Web & Lập Trình Ứng Dụng', author: 'Đào Xuân Hiệp', category: CATEGORY_MAP.cntt, image: 'lap-trinh-web.jpg',
      price: 180000, coverType: 'Bìa mềm', publisher: 'NXB Thanh Niên', year: 2022, pages: 400, stock: 10,
      desc: 'Sổ tay tổng hợp kiến thức và kỹ năng lập trình web và lập trình ứng dụng.' },
    { sku: 'MS011', title: 'Database Management System', author: 'Sotirios Zygiaris', category: CATEGORY_MAP.cntt, image: 'database-management-system.jpg',
      price: 220000, coverType: 'Bìa cứng', publisher: 'NXB Khoa Học Kỹ Thuật', year: 2021, pages: 450, stock: 8,
      desc: 'Tài liệu về các khái niệm và nguyên lý của hệ quản trị cơ sở dữ liệu.' },

    // ----- Sách thiếu nhi -----
    { sku: 'MS012', title: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài', category: CATEGORY_MAP.thieunhi, image: 'de-men-phieu-luu-ky.jpg',
      price: 75000, coverType: 'Bìa cứng', publisher: 'NXB Kim Đồng', year: 2019, pages: 160, stock: 22,
      desc: 'Tác phẩm kinh điển của Tô Hoài kể về cuộc phiêu lưu của chú Dế Mèn.' },
    { sku: 'MS013', title: 'Doraemon: Nobita Và Cuộc Phiêu Lưu Vào Thế Giới Trong Tranh', author: 'Fujiko F. Fujio', category: CATEGORY_MAP.thieunhi, image: 'doraemon.jpg',
      price: 25000, coverType: 'Bìa mềm', publisher: 'NXB Kim Đồng', year: 2020, pages: 190, stock: 50,
      desc: 'Cuộc phiêu lưu của Nobita, Doraemon và các bạn trong thế giới trong tranh.' },
    { sku: 'MS014', title: 'Hoàng Tử Rơm', author: 'Nhiều tác giả', category: CATEGORY_MAP.thieunhi, image: 'hoang-tu-rom.jpg',
      price: 45000, coverType: 'Bìa mềm', publisher: 'NXB Kim Đồng', year: 2021, pages: 48, stock: 14,
      desc: 'Truyện thiếu nhi dành cho các bạn nhỏ.' },
    { sku: 'MS015', title: 'Trí Khôn Của Ta Đây', author: 'Truyện cổ tích Việt Nam', category: CATEGORY_MAP.thieunhi, image: 'tri-khon-cua-ta-day.jpg',
      price: 30000, coverType: 'Bìa mềm', publisher: 'NXB Kim Đồng', year: 2018, pages: 32, stock: 25,
      desc: 'Truyện cổ tích Việt Nam về trí khôn và sự thông minh.' }
];

// Thêm đường dẫn đầy đủ cho ảnh: images/books/<tên file>
const BOOKS = BOOK_LIST.map((b) => ({ ...b, image: SITE_ROOT + 'images/books/' + b.image }));

function createCardHTML(book) {
    const buyButton = (book.stock > 0)
        ? `<button class="btn-buy" type="button"><img src="${SITE_ROOT}images/buy.png" alt="" width="16" height="16"> Chọn mua</button>`
        : `<button class="btn-buy" type="button" disabled>Hết hàng</button>`;

    return `
        <div class="product-card">
            <div class="card-image-wrapper">
                <span class="badge-sku">${escapeHtml(book.sku)}</span>
                <span class="badge-category">${escapeHtml(book.category)}</span>
                <img src="${escapeHtml(book.image)}" alt="${escapeHtml(book.title)}" class="book-cover" loading="lazy">
            </div>
            <div class="card-info">
                <p class="author">Tác giả: ${escapeHtml(book.author)}</p>
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-desc">${escapeHtml(book.desc)}</p>
                <div class="price-row">
                    <span class="price">Giá: ${formatPrice(book.price)}</span>
                    <span class="cover-type">${escapeHtml(book.coverType)}</span>
                </div>
            </div>
            <div class="card-actions">
                <a class="btn-detail" href="${PAGE_DETAIL}?sku=${encodeURIComponent(book.sku)}"><img src="${SITE_ROOT}images/seedetail.png" alt="" width="16" height="16"> Chi tiết</a>
                ${buyButton}
            </div>
        </div>`;
}

// Ô tìm kiếm trên header của các trang không có danh sách: chuyển sang products.html?q=...
function bindHeaderSearch() {
    const input = document.getElementById('searchInput');
    const go = () => { window.location.href = PAGE_PRODUCTS + '?q=' + encodeURIComponent(input.value.trim()); };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    document.getElementById('btnSearch').addEventListener('click', go);
}

/* ==========================================================
   B. TRANG CHỦ (data-page="home"): danh mục + sản phẩm nổi bật
   ========================================================== */

function initHome() {
    const FEATURED_COUNT = 8;

    // Ô tìm kiếm trên header -> chuyển sang products.html?q=...
    bindHeaderSearch();

    // Danh mục: mỗi thẻ dẫn tới products.html?category=<key>
    document.getElementById('categoryList').innerHTML = Object.entries(CATEGORY_MAP).map(([key, name]) => {
        const count = BOOKS.filter((b) => b.category === name).length;
        return `
            <a class="category-card" href="${PAGE_PRODUCTS}?category=${key}">
                <h3>${escapeHtml(name)}</h3>
                <p>${count} đầu sách</p>
                <span class="category-arrow">Xem sách &rarr;</span>
            </a>`;
    }).join('');

    // Sản phẩm nổi bật: tạm lấy các cuốn còn hàng đầu tiên
    // (có thể thêm trường featured: true vào BOOK_LIST để chọn thủ công)
    const featured = BOOKS.filter((b) => b.stock > 0).slice(0, FEATURED_COUNT);
    document.getElementById('featuredList').innerHTML = featured.map(createCardHTML).join('');
}

/* ==========================================================
   C. TRANG DANH SÁCH (data-page="products"): lọc, tìm kiếm, phân trang
   ========================================================== */

function initProducts() {

    /* ---------- 1. CẤU HÌNH (dữ liệu sách nằm ở phần A) ---------- */
    const ITEMS_PER_PAGE = 12;


    /* ---------- 2. DOM & TRẠNG THÁI ---------- */
    const productList         = document.getElementById('productList');
    const paginationContainer = document.querySelector('.pagination');

    const searchInput       = document.getElementById('searchInput');
    const btnSearch         = document.getElementById('btnSearch');
    const btnAdvancedFilter = document.getElementById('btnAdvancedFilter');
    const advDropdown       = document.getElementById('advanced-search-dropdown');
    const categorySelect    = document.getElementById('adv-category');
    const priceMinInput     = document.getElementById('adv-price-min');
    const priceMaxInput     = document.getElementById('adv-price-max');
    const inStockCheckbox   = document.getElementById('adv-in-stock');
    const btnApplyFilter    = document.getElementById('btnApplyFilter');

    const books = BOOKS;
    let filteredBooks = [...books];   // ban đầu chưa lọc nên chứa toàn bộ sách
    let currentPage = 1;


    /* ---------- 3. HÀM TIỆN ÍCH ---------- */
    // Bỏ dấu tiếng Việt để tìm "mat biec" vẫn ra "Mắt Biếc"
    const normalizeText = (str) => str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .trim();

    const getTotalPages = () => Math.max(1, Math.ceil(filteredBooks.length / ITEMS_PER_PAGE));


    /* ---------- 4. HIỂN THỊ ---------- */
    function renderProducts() {
        if (filteredBooks.length === 0) {
            productList.innerHTML = '<p class="empty-message">Không tìm thấy cuốn sách nào phù hợp.</p>';
            return;
        }
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const pageItems = filteredBooks.slice(start, start + ITEMS_PER_PAGE);
        productList.innerHTML = pageItems.map(createCardHTML).join('');
    }

    function renderPagination() {
        if (filteredBooks.length === 0) {   // ẩn phân trang nếu không có kết quả
            paginationContainer.innerHTML = '';
            return;
        }
        const totalPages = getTotalPages();

        let html = `<button class="page-btn" data-page="prev" type="button" ${currentPage === 1 ? 'disabled' : ''}>&lt; Trước</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}" type="button">${i}</button>`;
        }
        html += `<button class="page-btn" data-page="next" type="button" ${currentPage === totalPages ? 'disabled' : ''}>Sau &gt;</button>`;

        paginationContainer.innerHTML = html;
    }

    function updateView() {
        renderProducts();
        renderPagination();
    }


    /* ---------- 5. LỌC SÁCH ---------- */
    function applyFilters() {
        const keyword  = normalizeText(searchInput.value);
        const category = CATEGORY_MAP[categorySelect.value];   // undefined khi chọn "Tất cả"
        const minPrice = Number(priceMinInput.value) || 0;
        const maxRaw   = priceMaxInput.value.trim();
        const maxPrice = maxRaw === '' ? Infinity : Number(maxRaw);
        const onlyInStock = inStockCheckbox.checked;

        // Sách phải thỏa ĐỒNG THỜI cả 4 điều kiện
        filteredBooks = books.filter((book) =>
            (normalizeText(book.title).includes(keyword) || normalizeText(book.author).includes(keyword)) &&
            (!category || book.category === category) &&
            book.price >= minPrice && book.price <= maxPrice &&
            (!onlyInStock || (book.stock > 0))
        );

        currentPage = 1;
        updateView();
    }


    /* ---------- 6. MENU TÌM KIẾM NÂNG CAO ---------- */
    function setMenuOpen(open) {
        advDropdown.style.display = open ? 'block' : 'none';
        btnAdvancedFilter.setAttribute('aria-expanded', String(open));
    }


    /* ---------- 7. GẮN SỰ KIỆN ---------- */
    // Tìm kiếm
    searchInput.addEventListener('input', applyFilters);          // lọc ngay khi đang gõ
    btnSearch.addEventListener('click', applyFilters);
    btnApplyFilter.addEventListener('click', () => {
        applyFilters();
        setMenuOpen(false);                                        // chỉ đóng menu khi bấm "Áp dụng"
    });

    // Đóng/mở menu nâng cao
    btnAdvancedFilter.addEventListener('click', () => setMenuOpen(advDropdown.style.display !== 'block'));
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) setMenuOpen(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setMenuOpen(false);
    });

    // Phân trang (một listener duy nhất, dùng event delegation)
    paginationContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.page-btn');
        if (!btn || btn.disabled) return;

        const target = btn.dataset.page;
        if (target === 'prev') currentPage--;
        else if (target === 'next') currentPage++;
        else currentPage = Number(target);

        updateView();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    /* ---------- 8. KHỞI CHẠY ---------- */
    // Nhận điều kiện từ các trang khác: products.html?q=...&category=...
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) searchInput.value = params.get('q');
    if (CATEGORY_MAP[params.get('category')]) categorySelect.value = params.get('category');
    applyFilters();
}

/* ==========================================================
   D. TRANG CHI TIẾT (data-page="detail"): đọc ?sku=... trên URL
   ========================================================== */

function initDetail() {

    const ICON_CHECK = '<svg viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/></svg>';
    const ICON_TRUCK = '<svg viewBox="0 0 24 24" stroke="currentColor"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>';

    const container      = document.getElementById('detailContainer');
    const relatedSection = document.getElementById('relatedSection');
    const relatedList    = document.getElementById('relatedList');
    const relatedNote    = document.getElementById('relatedNote');

    const sku  = new URLSearchParams(window.location.search).get('sku');
    const book = BOOKS.find((b) => b.sku === sku);

    bindHeaderSearch();   // ô tìm kiếm trên header -> products.html?q=...

    /* ---------- Không tìm thấy sách ---------- */
    if (!book) {
        container.innerHTML = `<p class="empty-message">Không tìm thấy cuốn sách này. <a href="${PAGE_PRODUCTS}">Về danh sách sách</a></p>`;
        return;
    }

    document.title = `${book.title} - BookHub`;
    renderDetail();
    renderRelated();


    /* ---------- Hiển thị chi tiết ---------- */
    function renderDetail() {
        const inStock = book.stock > 0;
        const meta = (label, valueHtml) =>
            `<div><span class="meta-label">${label}</span><span class="meta-value">${valueHtml}</span></div>`;

        const purchase = inStock ? `
            <div class="purchase-row">
                <span class="qty-label">Số lượng mua:</span>
                <div class="qty-box">
                    <button type="button" id="qtyMinus" aria-label="Giảm">&minus;</button>
                    <span id="qtyValue">1</span>
                    <button type="button" id="qtyPlus" aria-label="Tăng">+</button>
                </div>
                <span class="qty-max">(Tối đa ${book.stock} cuốn)</span>
            </div>
            <button type="button" class="btn-add-cart" id="btnAddCart">Thêm vào giỏ hàng</button>`
            : `<button type="button" class="btn-add-cart" disabled>Tạm hết hàng</button>`;

        container.innerHTML = `
            <article class="detail-card">
                <div class="detail-left">
                    <div class="detail-cover">
                        <span class="badge-sku">Mã: ${escapeHtml(book.sku)}</span>
                        <span class="badge-category">${escapeHtml(book.category)}</span>
                        <img src="${escapeHtml(book.image)}" alt="${escapeHtml(book.title)}">
                    </div>
                    <div class="trust-row">
                        <span class="trust-item green">${ICON_CHECK} Sách chính hãng 100%</span>
                        <span class="trust-item orange">${ICON_TRUCK} Giao hàng toàn quốc</span>
                    </div>
                </div>

                <div class="detail-info">
                    <p class="detail-category">${escapeHtml(book.category)}</p>
                    <h1 class="detail-title">${escapeHtml(book.title)}</h1>
                    <p class="detail-author">Tác giả: <strong>${escapeHtml(book.author)}</strong></p>

                    <div class="price-box">
                        <div class="price-top">
                            <span class="price-label">Giá niêm yết</span>
                            <span class="price-note">(Đã bao gồm thuế GTGT &amp; chiết khấu cửa hàng)</span>
                        </div>
                        <div class="price-main">${book.price.toLocaleString('vi-VN')} <u>đ</u></div>
                    </div>

                    <div class="meta-grid">
                        ${meta('Nhà xuất bản', escapeHtml(book.publisher))}
                        ${meta('Năm xuất bản', book.year)}
                        ${meta('Số trang', book.pages + ' trang')}
                        ${meta('Hình thức bìa', escapeHtml(book.coverType))}
                        ${meta('Tình trạng kho hàng', inStock
                            ? `<span class="in-stock">Còn hàng (${book.stock} cuốn sẵn có)</span>`
                            : '<span class="out-stock">Hết hàng</span>')}
                    </div>

                    <h2 class="section-title">Tóm tắt nội dung tác phẩm</h2>
                    <p class="summary-box">${escapeHtml(book.desc)}</p>

                    ${purchase}
                </div>
            </article>`;

        if (inStock) bindPurchase();
    }

    /* ---------- Chọn số lượng & thêm vào giỏ ---------- */
    function bindPurchase() {
        const btnMinus = document.getElementById('qtyMinus');
        const btnPlus  = document.getElementById('qtyPlus');
        const qtyValue = document.getElementById('qtyValue');
        const btnAdd   = document.getElementById('btnAddCart');
        let qty = 1;

        const updateQty = () => {
            qtyValue.textContent = qty;
            btnMinus.disabled = qty <= 1;
            btnPlus.disabled  = qty >= book.stock;
        };
        btnMinus.addEventListener('click', () => { qty--; updateQty(); });
        btnPlus.addEventListener('click',  () => { qty++; updateQty(); });
        updateQty();

        btnAdd.addEventListener('click', () => {
            addToCart(book.sku, qty);
            btnAdd.textContent = 'Đã thêm vào giỏ hàng ✓';
            setTimeout(() => { btnAdd.textContent = 'Thêm vào giỏ hàng'; }, 1500);
        });
    }

    // Giỏ hàng lưu trong localStorage dạng { "MS001": 2, "MS005": 1 }
    function addToCart(itemSku, qty) {
        let cart = {};
        try { cart = JSON.parse(localStorage.getItem('cart')) || {}; } catch (e) { cart = {}; }
        cart[itemSku] = Math.min((cart[itemSku] || 0) + qty, book.stock);
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    /* ---------- Sách cùng thể loại ---------- */
    function renderRelated() {
        const related = BOOKS.filter((b) => b.category === book.category && b.sku !== book.sku).slice(0, 4);
        if (related.length === 0) return;

        relatedNote.textContent = 'Cùng chuyên mục ' + book.category;
        relatedList.innerHTML = related.map((b) => `
            <a class="related-card" href="${PAGE_DETAIL}?sku=${encodeURIComponent(b.sku)}">
                <img src="${escapeHtml(b.image)}" alt="${escapeHtml(b.title)}" loading="lazy">
                <div class="related-title">${escapeHtml(b.title)}</div>
                <div class="related-author">${escapeHtml(b.author)}</div>
                <div class="related-price">${formatPrice(b.price)}</div>
            </a>`).join('');
        relatedSection.hidden = false;
    }
}

/* ==========================================================
   E. KHỞI CHẠY
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const initPage = { home: initHome, products: initProducts, detail: initDetail }[document.body.dataset.page];
    if (initPage) initPage();
});