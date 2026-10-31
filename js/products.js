/* ==========================================================
    BOOKHUB - products.js
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

// Danh mục và sách luôn được đọc từ nguồn localStorage do data.js khởi tạo.
const getCategoriesForSite = () => getData('categories').filter(c => c.status !== 'inactive');
const makeCategoryMap = () => Object.fromEntries(
    getCategoriesForSite().map(c => [c.key || c.categoryId, c.categoryName])
);
let CATEGORY_MAP = makeCategoryMap();

const toSiteBook = (p) => {
    const category = getData('categories').find(c => c.categoryId === p.categoryId);
    const imageName = p.image || '';
    return {
        sku: p.productId,
        title: p.productName || '',
        author: p.author || '',
        category: category?.categoryName || '',
        categoryKey: category?.key || category?.categoryId || '',
        image: /^data:image\//i.test(imageName) ||
            /^https?:\/\//i.test(imageName) ||
            imageName.startsWith("/")
            ? imageName
            : SITE_ROOT + "images/books/" + imageName,
        price: Number(p.salePrice || 0),
        coverType: p.coverType || 'Bìa mềm',
        publisher: p.publisher || '',
        year: p.year || '',
        pages: p.pages || '',
        stock: Number(p.stockQuantity || 0),
        desc: p.description || '',
        status: p.status || 'active'
    };
};

const loadSiteBooks = () => getData('products')
    .filter(p => p.status !== 'inactive')
    .map(toSiteBook);
let BOOKS = loadSiteBooks();

// Cập nhật trang khách khi admin thay đổi dữ liệu ở tab khác.
window.addEventListener('storage', (event) => {
    if (['products', 'categories'].includes(event.key)) window.location.reload();
});

// ----- Giỏ hàng dùng chung: nút "Chọn mua" (thẻ sách) và nút "Thêm vào giỏ hàng" (trang chi tiết) -----
// Lưu trong localStorage (khóa "cart") dạng { "MS001": 2, "MS005": 1 }: mã sách -> số lượng
function getCurrentCartUser() {
    try {
        const user = JSON.parse(localStorage.getItem("currentUser") || "null");
        return user && user.customerId ? user : null;
    } catch (error) {
        return null;
    }
}

// Tạo khóa giỏ hàng riêng theo mã khách hàng
function getCartKey() {
    const user = getCurrentCartUser();
    return user ? "cart_" + user.customerId : null;
}

// Lấy giỏ hàng của tài khoản đang đăng nhập
function getCart() {
    const key = getCartKey();
    if (!key) return {};

    try {
        const cart = JSON.parse(localStorage.getItem(key) || "{}");
        if (!cart || typeof cart !== "object") return {};

        if (Array.isArray(cart)) {
            return Object.fromEntries(
                cart.filter(item => item && item.productId)
                    .map(item => [item.productId, Number(item.quantity)])
            );
        }

        return cart;
    } catch (error) {
        return {};
    }
}

// Thêm sách vào giỏ hàng
function addToCart(sku, qty = 1) {
    const user = getCurrentCartUser();

    // Chưa đăng nhập không được thêm sách
    if (!user) {
        alert("Vui lòng đăng nhập trước khi thêm sách vào giỏ hàng!");
        window.location.href = SITE_ROOT + "customer/login.html";
        return -1;
    }

    const quantity = Number(qty);
    if (!Number.isSafeInteger(quantity) || quantity <= 0) return 0;

    // Lấy thông tin tồn kho mới nhất
    const products = getData("products");
    const product = products.find(p => p.productId === sku);
    if (!product || product.status === "inactive") return 0;

    const stock = Number(product.stockQuantity || 0);
    if (!Number.isSafeInteger(stock) || stock <= 0) return 0;

    const cart = getCart();
    const before = Number(cart[sku] || 0);
    const added = Math.max(0, Math.min(quantity, stock - before));

    if (added <= 0) return 0;

    cart[sku] = before + added;

    // Lưu giỏ hàng riêng của khách hàng
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    return added;
}

function createCardHTML(book) {
    const buyButton = (book.stock > 0)
        ? `<button class="btn-buy" type="button" data-sku="${escapeHtml(book.sku)}"><img src="${SITE_ROOT}images/buy.png" alt="" width="16" height="16"> Chọn mua</button>`
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

// Nút "Chọn mua" trên thẻ sách
function initBuyButtons() {
    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".btn-buy");
        if (!btn || btn.disabled || btn.dataset.busy) return;

        const added = addToCart(btn.dataset.sku, 1);

        // Chưa đăng nhập thì không hiện "Đã thêm"
        if (added === -1) return;

        const oldHTML = btn.innerHTML;
        btn.dataset.busy = "1";
        
        if (added > 0) {
            btn.textContent = "Đã thêm ✓";
            if (typeof updateCartBadge === 'function') updateCartBadge();
            
            // Hiển thị trên hộp thoại của trình duyệt
            alert("Đã thêm vào giỏ hàng thành công"); 
        } else {
            btn.textContent = "Hết hàng hoặc đã đủ số lượng";
        }

        setTimeout(function () {
            btn.innerHTML = oldHTML;
            delete btn.dataset.busy;
        }, 1200);
    });
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

// ----- Banner trượt ở trang chủ: đổi qua lại giữa vài cuốn sách -----
function initHeroSlider() {
    const HERO_SKUS = ['MS004', 'MS008', 'MS009', 'MS012', 'MS002'];   // mã các cuốn hiện trên banner (sửa tại đây)
    const INTERVAL = 5000;                                              // tự chuyển sau 5 giây

    const root = document.getElementById('heroSlider');
    if (!root) return;
    const books = HERO_SKUS.map((sku) => BOOKS.find((b) => b.sku === sku)).filter((b) => b && b.stock > 0);
    if (books.length === 0) { root.hidden = true; return; }

    const slidesBox = document.getElementById('heroSlides');
    const dotsBox = document.getElementById('heroDots');
    slidesBox.innerHTML = books.map((b, i) => `
        <div class="hero-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${books.length}">
            <img class="hero-slide-cover" src="${escapeHtml(b.image)}" alt="Bìa sách ${escapeHtml(b.title)}"${i ? ' loading="lazy"' : ''}>
            <div class="hero-slide-info">
                <span class="hero-slide-cat">${escapeHtml(b.category)}</span>
                <h3 class="hero-slide-title">${escapeHtml(b.title)}</h3>
                <p class="hero-slide-author">${escapeHtml(b.author)}</p>
                <p class="hero-slide-price">${formatPrice(b.price)}</p>
                <a class="hero-slide-link" href="${PAGE_DETAIL}?sku=${encodeURIComponent(b.sku)}">Xem chi tiết</a>
            </div>
        </div>`).join('');
    dotsBox.innerHTML = books.map((b, i) => `<button type="button" class="hero-dot" aria-label="Xem sách ${i + 1}: ${escapeHtml(b.title)}"></button>`).join('');

    const slides = [...slidesBox.children];
    const dots = [...dotsBox.children];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    let timer = null;

    function show(i) {
        current = (i + books.length) % books.length;
        slides.forEach((s, n) => { s.classList.toggle('active', n === current); s.setAttribute('aria-hidden', String(n !== current)); });
        dots.forEach((d, n) => { d.classList.toggle('active', n === current); d.setAttribute('aria-current', String(n === current)); });
    }
    const stop = () => { clearInterval(timer); timer = null; };
    const play = () => { stop(); if (!reduceMotion && books.length > 1) timer = setInterval(() => show(current + 1), INTERVAL); };
    const go = (i) => { show(i); play(); };          // người dùng bấm -> đếm lại 5 giây từ đầu

    document.getElementById('heroPrev').addEventListener('click', () => go(current - 1));
    document.getElementById('heroNext').addEventListener('click', () => go(current + 1));
    dots.forEach((d, n) => d.addEventListener('click', () => go(n)));

    // Rê chuột hoặc đang focus vào banner thì tạm dừng; rời đi thì chạy tiếp
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', play);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else play(); });
    root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') go(current - 1);
        if (e.key === 'ArrowRight') go(current + 1);
    });

    // Vuốt trái/phải trên điện thoại
    let startX = null;
    slidesBox.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    slidesBox.addEventListener('pointerup', (e) => {
        if (startX !== null && Math.abs(e.clientX - startX) > 40) go(current + (e.clientX < startX ? 1 : -1));
        startX = null;
    });

    if (books.length === 1) root.querySelector('.hero-controls').hidden = true;
    show(0);
    play();
}

function initHome() {
    const FEATURED_COUNT = 8;

    initHeroSlider();   // banner trượt

    // Ô tìm kiếm trên header -> chuyển sang products.html?q=...
    bindHeaderSearch();

    // Danh mục: mỗi thẻ dẫn tới products.html?category=<key>
    document.getElementById('categoryList').innerHTML = Object.entries(CATEGORY_MAP).map(([key, name]) => {
        const count = BOOKS.filter((b) => b.categoryKey === key).length;
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

    // Bổ sung danh mục do admin tạo, giữ lại lựa chọn "Tất cả".
    if (categorySelect) {
        const existingValues = new Set([...categorySelect.options].map(option => option.value));
        getCategoriesForSite().forEach(category => {
            const key = category.key || category.categoryId;
            if (!existingValues.has(key)) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = category.categoryName;
                categorySelect.appendChild(option);
            }
        });
    }

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

        btnAdd.addEventListener("click", function () {
            const added = addToCart(book.sku, qty);
            if (added === -1) return;

            if (added === 0) {
                alert("Sách hết hàng hoặc giỏ đã đủ số lượng.");
                return;
            }

            btnAdd.textContent = "Đã thêm vào giỏ hàng ✓";
            if (typeof updateCartBadge === 'function') updateCartBadge(); // Cập nhật số giỏ hàng
            
            // Hiển thị trên hộp thoại của trình duyệt
            alert("Đã thêm vào giỏ hàng thành công");
            
            setTimeout(function () {
                btnAdd.textContent = "Thêm vào giỏ hàng";
            }, 1500);
        });
    }

    /* ---------- Sách cùng thể loại ---------- */
    function renderRelated() {
        const related = BOOKS.filter((b) => b.category === book.category && b.sku !== book.sku).slice(0, 4);
        if (related.length === 0) return;

        relatedNote.textContent = 'Cùng danh mục ' + book.category;
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
   E. MENU DANH MỤC TRÊN MÀN HÌNH NHỎ (≤ 1100px)
   - Máy tính: rê chuột là mở (CSS lo)
   - ≤ 1100px: bấm dấu 3 gạch (nút "Danh mục") để mở, menu trượt ra từ bên trái
   ========================================================== */

function initCategoryMenu() {
    const wrapper = document.querySelector('.category-wrapper');
    if (!wrapper) return;   // trang không có menu danh mục thì bỏ qua

    const btn  = wrapper.querySelector('.category-btn');
    const back = wrapper.querySelector('.category-back');
    const list = wrapper.querySelector('.category-dropdown');
    if (!btn || !list) return;

    const isMobile = window.matchMedia('(max-width: 1100px)');   // phải trùng với mốc @media (max-width: 1100px) trong CSS

    // Ở ≤ 1100px nút chỉ còn dấu 3 gạch (chữ bị ẩn), nên cần nhãn cho trình đọc màn hình
    btn.setAttribute('aria-label', 'Danh mục sách');
    btn.setAttribute('aria-expanded', 'false');

    const setOpen = (open) => {
        wrapper.classList.toggle('open', open);           // CSS dựa vào class này để trượt menu
        document.body.classList.toggle('category-open', open); // khóa cuộn trang
        btn.setAttribute('aria-expanded', String(open));
    };

    // Bấm nút Danh mục: chỉ có tác dụng ở màn hình nhỏ
    btn.addEventListener('click', () => {
        if (isMobile.matches) setOpen(!wrapper.classList.contains('open'));
    });

    // Nút "← Quay lại"
    if (back) back.addEventListener('click', () => setOpen(false));

    // Bấm vào nền tối thì đóng (nền là pseudo-element của wrapper nên e.target chính là wrapper)
    wrapper.addEventListener('click', (e) => {
        if (e.target === wrapper) setOpen(false);
    });

    // Chọn 1 thể loại thì đóng menu
    list.addEventListener('click', (e) => {
        if (e.target.closest('a')) setOpen(false);
    });

    // Nhấn Esc để đóng
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
    });

    // Phóng to cửa sổ quá 1100px thì tự đóng, tránh bị kẹt khóa cuộn
    isMobile.addEventListener('change', (e) => {
        if (!e.matches) setOpen(false);
    });
}

/* ==========================================================
   F. KHỞI CHẠY
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initCategoryMenu();
    initBuyButtons();
    const initPage = { home: initHome, products: initProducts, detail: initDetail }[document.body.dataset.page];
    if (initPage) initPage();
});