const currentUser = JSON.parse(localStorage.getItem("currentUser")) 

document.addEventListener("DOMContentLoaded", function () {
    const userView = document.querySelector(".user-view");
    const userLogin = document.getElementById("user");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const userDropdown = document.getElementById("userDropdown");
    const logoutBtn = document.getElementById("logoutBtn"); //Đăng xuất


    //Link voiws title đăng kí, đăng nhập, admin
    const loginLink = document.querySelector('.action-section a[title="Đăng nhập"]');
    const registerLink = document.querySelector('.action-section a[title="Đăng ký tài khoản"]');
    const adminLink = document.querySelector('.action-section a[title="Đi đến khu vực admin"]');


    if(currentUser) {
        usernameDisplay.textContent = currentUser.userName;
        userView.style.display = "block";

        loginLink.style.display = "none";
        registerLink.style.display = "none";
        adminLink.style.display = "none";
    } 
    else {
        userView.style.display = "none";

        loginLink.style.display = "";
        registerLink.style.display = "";
        adminLink.style.display = "";
    }

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
        if (event.key === "Escape") {
            userDropdown.classList.remove("show");
        }
    });

    // Đăng xuất
    logoutBtn.addEventListener("click", logout);
});



// Nhớ trang hiện tại khi bấm vào liên kết Đăng nhập / Đăng ký
document.addEventListener("click", function (e) {
    const link = e.target.closest('a[href*="login.html"], a[href*="register.html"]');
    if (!link) return;

    // Đang ở chính trang đăng nhập/đăng ký thì giữ nguyên địa chỉ đã nhớ trước đó
    const currentPage = window.location.pathname.split("/").pop().toLowerCase();
    if (currentPage === "login.html" || currentPage === "register.html") return;
    sessionStorage.setItem("returnUrl", window.location.href);
});


// Đăng xuất nhưng vẫn giữ giỏ hàng của từng tài khoản
function logout() {

    // Chỉ xóa thông tin đăng nhập
    localStorage.removeItem("currentUser");

    // KHÔNG xóa cart_customerId
    // KHÔNG gọi saveCart({})
    // KHÔNG xóa dữ liệu giỏ hàng

    const path = window.location.pathname;
    const page = path.split("/").pop().toLowerCase();

    const loginRequiredPages = [
        "cart.html",
        "checkout.html",
        "profile.html",
        "orders.html"
    ];

    if (loginRequiredPages.includes(page)) {
        // Từ trang customer quay về trang chủ
        window.location.href = "../index.html";
    } else {
        // Cập nhật giao diện đăng xuất
        window.location.reload();
    }
}
