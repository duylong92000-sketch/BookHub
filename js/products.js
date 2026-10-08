/* ==========================================================
   BOOKHUB - main.js (một file JS duy nhất cho cả website)

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

function createMockBooks(total = 24) {
    const samples = [
        { category: 'Văn học & Tiểu thuyết', title: 'Mắt Biếc',                image: SITE_ROOT + 'images/mat-biec.jpg' },
        { category: 'Văn học & Tiểu thuyết', title: 'Nhà Giả Kim',             image: SITE_ROOT + 'images/nha-gia-kim.jpg' },
        { category: 'Công nghệ thông tin',   title: 'Lập Trình Web Toàn Diện', image: SITE_ROOT + 'images/lap-trinh-web.jpg' },
        { category: 'Kinh tế & Quản trị',    title: 'Cha Giàu Cha Nghèo',      image: SITE_ROOT + 'images/nha-gia-kim.jpg' },
        { category: 'Sách thiếu nhi',        title: 'Dế Mèn Phiêu Lưu Ký',     image: SITE_ROOT + 'images/mat-biec.jpg' }
    ];
    const publishers = ['NXB Trẻ', 'NXB Kim Đồng', 'NXB Văn Học', 'NXB Giáo Dục'];

    return Array.from({ length: total }, (_, k) => {
        const i = k + 1;
        const sample = samples[i % samples.length];
        return {
            sku: 'MS' + String(i).padStart(3, '0'),
            category: sample.category,
            image: sample.image,
            title: `${sample.title} - Bản ${i}`,
            author: `Tác giả số ${i}`,
            desc: `Đây là mô tả tóm tắt cho cuốn sách số ${i}...`,
            price: (50 + i * 10) * 1000,            // đơn vị: đồng
            coverType: i % 2 === 0 ? 'Bìa cứng' : 'Bìa mềm',
            publisher: publishers[i % publishers.length],
            year: 2015 + (i % 10),
            pages: 150 + i * 12,
            stock: i % 4 === 0 ? 0 : 10 + i         // số cuốn trong kho (0 = hết hàng)
        };
    });
}

const BOOKS = createMockBooks();

// value của <option> trong products.html  ->  tên thể loại trong dữ liệu
const CATEGORY_MAP = {
    vanhoc:   'Văn học & Tiểu thuyết',
    kinhte:   'Kinh tế & Quản trị',
    cntt:     'Công nghệ thông tin',
    thieunhi: 'Sách thiếu nhi'
};

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
    // (khi có dữ liệu thật, có thể thêm trường featured: true để chọn thủ công)
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
