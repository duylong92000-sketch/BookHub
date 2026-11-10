function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

//Hàm đổi giao diện sau khi đăng nhập thành công. Cập nhật giao diện ngay, không cần reload
function updateUserUI() {
    const currentUser = getCurrentUser();

    const userView = document.querySelector(".user-view");
    const usernameDisplay = document.getElementById("usernameDisplay");

    const loginLink = document.querySelector('.action-section a[title="Đăng nhập"]');
    const registerLink = document.querySelector('.action-section a[title="Đăng ký tài khoản"]');
    const adminLink = document.querySelector('.action-section a[title="Đi đến khu vực admin"]');

    if (currentUser) {
        usernameDisplay.textContent = currentUser.userName;
        userView.style.display = "block";
        loginLink.style.display = "none";
        registerLink.style.display = "none";
        adminLink.style.display = "none";
    } else {
        userView.style.display = "none";
        loginLink.style.display = "";
        registerLink.style.display = "";
        adminLink.style.display = "";
    }
}

//Tính năng của menu user
document.addEventListener("DOMContentLoaded", function () {
    const userView = document.querySelector(".user-view");
    const userLogin = document.getElementById("user");
    const userDropdown = document.getElementById("userDropdown");
    const logoutBtn = document.getElementById("logoutBtn");

    updateUserUI();

    // Bấm tên tài khoản để mở hoặc đóng menu
    userLogin.addEventListener("click", function (event) {
        event.stopPropagation();
        userDropdown.classList.toggle("show");
    });

    // Bấm ra ngoài menu để đóng
    document.addEventListener("click", function (event) {
        if (!userView.contains(event.target)) {
            userDropdown.classList.remove("show");
        }
    });

    // Đóng menu khi nhấn phím Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") userDropdown.classList.remove("show");
    });

    //Đóng menu khi chuyển hash
    window.addEventListener("hashchange", function () {
        userDropdown.classList.remove("show");
        updateUserUI(); 
    });

    //Đăng xuất
    logoutBtn.addEventListener("click", logout);
});



// Nhớ trang hiện tại khi bấm vào liên kết Đăng nhập / Đăng ký
document.addEventListener("click", function (e) {
    const link = e.target.closest('a[href$="#login"], a[href$="#register"]');
    if (!link) return;

    // Đang ở chính trang đăng nhập/đăng ký thì giữ nguyên địa chỉ đã nhớ trước đó
    if (/^#(login|register)/.test(window.location.hash)) return;
    sessionStorage.setItem("returnUrl", window.location.href);
});


// Đăng xuất nhưng vẫn giữ giỏ hàng của từng tài khoản
function logout() {
    // Chỉ xóa thông tin đăng nhập, giữ nguyên giỏ hàng từng tài khoản
    localStorage.removeItem("currentUser");

    // Đang ở trang customer thì quay về trang chủ
    const isCustomerPage = window.location.pathname.includes("customer");
    if (isCustomerPage) {
        window.location.href = "../index.html#home";
        return;
    }

    // Đang ở index.html: nếu đang ở view cần đăng nhập thì đưa về #home
    const protectedViews = ["#cart", "#checkout", "#profile", "#orders", "#success"];
    if (protectedViews.some(v => window.location.hash.startsWith(v))) {
        window.location.hash = "#home";
    }

    // Cập nhật giao diện ngay, không cần reload
    updateUserUI();
}
