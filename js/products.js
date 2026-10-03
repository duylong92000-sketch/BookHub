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