document.addEventListener('DOMContentLoaded', function() {
    
    const searchInput = document.getElementById('searchInput');
    const btnSearch = document.getElementById('btnSearch');

    // Hàm thực hiện tìm kiếm (Giữ nguyên như cũ)
    function searchBooks() {
        const keyword = searchInput.value.toLowerCase().trim();
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const titleElement = card.querySelector('.book-title');
            const titleText = titleElement.innerText.toLowerCase();
            
            if (titleText.includes(keyword)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // 1. TÌM KIẾM NGAY KHI GÕ (Real-time search)
    // Bắt sự kiện 'input' để chạy hàm searchBooks liên tục mỗi khi phím được gõ
    searchInput.addEventListener('input', searchBooks);

    // 2. Giữ lại sự kiện click cho nút Kính lúp (dành cho thói quen của một số người dùng)
    btnSearch.addEventListener('click', searchBooks);

    // Bạn có thể xóa phần bắt sự kiện phím Enter đi vì sự kiện 'input' đã bao trọn việc xử lý khi gõ phím rồi.
});

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. TẠO DỮ LIỆU MÔ PHỎNG (MOCK DATA) - 24 CUỐN SÁCH
    // Mình dùng vòng lặp để tạo nhanh 24 cuốn sách. Sau này bạn chỉ cần sửa mảng này bằng dữ liệu thật.
    const books = [];
    const sampleCovers = ["images/mat-biec.jpg", "images/nha-gia-kim.jpg", "images/lap-trinh-web.jpg"];
    const sampleCategories = ["Văn học & Tiểu thuyết", "Văn học & Tiểu thuyết", "Công nghệ thông tin"];
    const sampleTitles = ["Mắt Biếc", "Nhà Giả Kim", "Lập Trình Web Toàn Diện"];

    for (let i = 1; i <= 24; i++) {
        let index = i % 3; // Lặp lại 3 mẫu sách ngẫu nhiên
        books.push({
            sku: "MS" + String(i).padStart(3, '0'), // Tạo mã MS001 -> MS024
            category: sampleCategories[index],
            image: sampleCovers[index],
            title: sampleTitles[index] + " - Bản đặc biệt " + i,
            author: "Tác giả số " + i,
            desc: "Đây là mô tả tóm tắt cho cuốn sách số " + i + ". Tác phẩm mang lại nhiều giá trị sâu sắc...",
            price: (50 + i * 10) + ".000 đ",
            coverType: i % 2 === 0 ? "Bìa cứng" : "Bìa mềm"
        });
    }

    // 2. CẤU HÌNH PHÂN TRANG
    let currentPage = 1;
    const itemsPerPage = 12; // 12 cuốn 1 trang
    const totalPages = Math.ceil(books.length / itemsPerPage); // Tự động tính ra 2 trang

    const productList = document.getElementById('productList');
    const paginationContainer = document.querySelector('.pagination');

    // 3. HÀM RENDER (ĐỔ SẢN PHẨM RA MÀN HÌNH)
    function renderProducts(page) {
        // Xóa sạch khung chứa HTML cũ (những gì bạn viết tay trong file index.html sẽ bị xóa đi để nhường chỗ cho JS)
        productList.innerHTML = '';

        // Tính toán lấy từ cuốn số mấy đến số mấy
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const booksToDisplay = books.slice(startIndex, endIndex);

        // Đổ thẻ HTML cho từng cuốn sách
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
                            <span class="price">Giá: ${book.price}</span>
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

    // 4. HÀM RENDER NÚT PHÂN TRANG VÀ GẮN SỰ KIỆN CLICK
    function renderPagination() {
        paginationContainer.innerHTML = ''; // Xóa các nút phân trang cứng trong HTML

        // Tạo nút "Trước"
        const prevDisabled = currentPage === 1 ? 'disabled' : '';
        paginationContainer.insertAdjacentHTML('beforeend', `<button class="page-btn ${prevDisabled}" id="prevBtn" type="button">&lt; Trước</button>`);

        // Tạo các nút số trang (1, 2)
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationContainer.insertAdjacentHTML('beforeend', `<button class="page-btn ${activeClass}" data-page="${i}" type="button">${i}</button>`);
        }

        // Tạo nút "Sau"
        const nextDisabled = currentPage === totalPages ? 'disabled' : '';
        paginationContainer.insertAdjacentHTML('beforeend', `<button class="page-btn ${nextDisabled}" id="nextBtn" type="button">Sau &gt;</button>`);

        // --- Gắn sự kiện click cho các nút vừa tạo ---
        
        // Bấm nút "Trước"
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateView();
            }
        });

        // Bấm nút "Sau"
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateView();
            }
        });

        // Bấm vào từng con số (1 hoặc 2)
        const pageNumbers = paginationContainer.querySelectorAll('.page-btn[data-page]');
        pageNumbers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentPage = parseInt(e.target.getAttribute('data-page'));
                updateView();
            });
        });
    }

    // 5. HÀM CẬP NHẬT TOÀN BỘ GIAO DIỆN MỖI KHI ĐỔI TRANG
    function updateView() {
        renderProducts(currentPage);
        renderPagination();
        // Cuộn trang lên trên cùng để khách hàng xem từ đầu danh sách
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }

    // Khởi chạy khi vừa vào trang web (hiển thị trang 1)
    updateView();

});

const btnAdvancedFilter = document.getElementById('btnAdvancedFilter');
    const advDropdown = document.getElementById('advanced-search-dropdown');

    // Mở/Đóng menu khi click vào nút chiếc phễu
    btnAdvancedFilter.addEventListener('click', function(e) {
        e.stopPropagation(); // Ngăn sự kiện lan truyền lên body
        
        // Kiểm tra xem menu đang ẩn hay hiện
        if (advDropdown.style.display === 'block') {
            advDropdown.style.display = 'none';
        } else {
            advDropdown.style.display = 'block';
        }
    });

    // Ẩn menu khi nhấp chuột ra vùng bất kỳ ngoài dropdown
    document.addEventListener('click', function(e) {
        if (!advDropdown.contains(e.target) && e.target !== btnAdvancedFilter) {
            advDropdown.style.display = 'none';
        }
    });

    // Ngăn việc click bên trong dropdown bị đóng menu
    advDropdown.addEventListener('click', function(e) {
        e.stopPropagation(); 
    });