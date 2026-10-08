document.addEventListener('DOMContentLoaded', function() {
    
    // 1. DỮ LIỆU MÔ PHỎNG (MOCK DATA)
    const books = [];
    const sampleCovers = ["images/mat-biec.jpg", "images/nha-gia-kim.jpg", "images/lap-trinh-web.jpg", "images/nha-gia-kim.jpg"];
    const sampleCategories = ["Văn học & Tiểu thuyết", "Kinh tế & Quản trị", "Công nghệ thông tin", "Sách thiếu nhi"];
    const sampleTitles = ["Mắt Biếc", "Cha Giàu Cha Nghèo", "Lập Trình Web Toàn Diện", "Dế Mèn Phiêu Lưu Ký"];

    for (let i = 1; i <= 24; i++) {
        let index = i % sampleCategories.length;
        books.push({
            sku: "MS" + String(i).padStart(3, '0'),
            category: sampleCategories[index],
            image: sampleCovers[index],
            title: sampleTitles[index] + " - Bản " + i,
            author: "Tác giả số " + i,
            desc: "Đây là mô tả tóm tắt cho cuốn sách số " + i + "...",
            price: (50 + i * 10),
            coverType: i % 2 === 0 ? "Bìa cứng" : "Bìa mềm",
            inStock: i % 4 !== 0   // cứ 4 cuốn thì 1 cuốn hết hàng
    });
}   

    // Mảng này chứa sách đã được lọc. Ban đầu chưa lọc nên nó chứa toàn bộ sách.
    let filteredBooks = [...books]; 

    // 2. CẤU HÌNH PHÂN TRANG VÀ RENDER GIAO DIỆN
    let currentPage = 1;
    const itemsPerPage = 12; 
    let totalPages = Math.ceil(filteredBooks.length / itemsPerPage); 

    const productList = document.getElementById('productList');
    const paginationContainer = document.querySelector('.pagination');

    function renderProducts(page) {
        productList.innerHTML = '';
        
        // Nếu không có sách nào thỏa điều kiện lọc
        if (filteredBooks.length === 0) {
            productList.innerHTML = '<p style="grid-column: span 4; text-align: center; margin-top: 20px;">Không tìm thấy cuốn sách nào phù hợp.</p>';
            return;
        }

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const booksToDisplay = filteredBooks.slice(startIndex, endIndex);

        booksToDisplay.forEach(book => {
            const cardHTML = `
                <div class="product-card">
                    <div class="card-image-wrapper">
                        <span class="badge-sku">${book.sku}</span>
                        <span class="badge-category">${book.category}</span>
                        <img src="${book.image}" alt="${book.title}" class="book-cover">
                    </div>
                    <div class="card-info">
                        <p class="author">Tác giả: ${book.author}</p>
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-desc">${book.desc}</p>
                        <div class="price-row">
                            <span class="price">Giá: ${book.price}.000 đ</span>
                            <span class="cover-type">${book.coverType}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-detail" type="button"><img src="images/seedetail.png" width="16" height="16"> Chi tiết</button>
                        <button class="btn-buy" type="button"><img src="images/buy.png" width="16" height="16"> Chọn mua</button>
                    </div>
                </div>
            `;
            productList.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    function renderPagination() {
        paginationContainer.innerHTML = ''; 
        if (filteredBooks.length === 0) return; // Ẩn phân trang nếu không có kết quả

        const prevDisabled = currentPage === 1 ? 'disabled' : '';
        paginationContainer.insertAdjacentHTML('beforeend', `<button class="page-btn ${prevDisabled}" id="prevBtn" type="button">&lt; Trước</button>`);

        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationContainer.insertAdjacentHTML('beforeend', `<button class="page-btn ${activeClass}" data-page="${i}" type="button">${i}</button>`);
        }

        const nextDisabled = currentPage === totalPages ? 'disabled' : '';
        paginationContainer.insertAdjacentHTML('beforeend', `<button class="page-btn ${nextDisabled}" id="nextBtn" type="button">Sau &gt;</button>`);

        // Gắn sự kiện cho các nút phân trang
        const btnPrev = document.getElementById('prevBtn');
        if(btnPrev) btnPrev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; updateView(); } });

        const btnNext = document.getElementById('nextBtn');
        if(btnNext) btnNext.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; updateView(); } });

        paginationContainer.querySelectorAll('.page-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentPage = parseInt(e.target.getAttribute('data-page'));
                updateView();
            });
        });
    }

    function updateView() {
        renderProducts(currentPage);
        renderPagination();
    }

    // Chạy render lần đầu tiên
    updateView();


    // 3. XỬ LÝ MENU TÌM KIẾM NÂNG CAO (ĐÓNG/MỞ)
    const btnAdvancedFilter = document.getElementById('btnAdvancedFilter');
    const advDropdown = document.getElementById('advanced-search-dropdown');

    btnAdvancedFilter.addEventListener('click', function(e) {
        e.stopPropagation(); 
        if (advDropdown.style.display === 'block') {
            advDropdown.style.display = 'none';
        } else {
            advDropdown.style.display = 'block';
        }
    });

    document.addEventListener('click', function(e) {
        if (!advDropdown.contains(e.target) && e.target !== btnAdvancedFilter) {
            advDropdown.style.display = 'none';
        }
    });

    advDropdown.addEventListener('click', function(e) {
        e.stopPropagation(); 
    });


    // 4. CHỨC NĂNG LỌC SÁCH THỰC TẾ
    // 4. CHỨC NĂNG LỌC SÁCH
const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');
const btnApplyFilter = document.getElementById('btnApplyFilter');

const categoryMap = {
    vanhoc:   'Văn học & Tiểu thuyết',
    kinhte:   'Kinh tế & Quản trị',
    cntt:     'Công nghệ thông tin',
    thieunhi: 'Sách thiếu nhi'
};

function executeFilter(closeMenu = false) {
    const keyword = searchInput.value.toLowerCase().trim();
    const selectedCategory = document.getElementById('adv-category').value;
    const minPrice = parseInt(document.getElementById('adv-price-min').value) || 0;
    const maxPrice = parseInt(document.getElementById('adv-price-max').value) || Infinity;
    const onlyInStock = document.getElementById('adv-in-stock').checked;

    filteredBooks = books.filter(book => {
        const matchKeyword = book.title.toLowerCase().includes(keyword)
                          || book.author.toLowerCase().includes(keyword);

        const matchCategory = selectedCategory === 'all'
                           || book.category === categoryMap[selectedCategory];

        const price = book.price * 1000;
        const matchPrice = price >= minPrice && price <= maxPrice;

        const matchStock = !onlyInStock || book.inStock;

        return matchKeyword && matchCategory && matchPrice && matchStock;
    });

    totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;
    currentPage = 1;
    updateView();

    if (closeMenu) advDropdown.style.display = 'none';
}

searchInput.addEventListener('input', () => executeFilter(false));
btnSearch.addEventListener('click', () => executeFilter(false));
btnApplyFilter.addEventListener('click', () => executeFilter(true));

});