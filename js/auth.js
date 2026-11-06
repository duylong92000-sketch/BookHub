/* ==========================================================
   BOOKHUB - auth.js
   Toàn bộ xác thực của website nằm ở đây:
     1. Quản trị viên: kiểm tra đăng nhập, phiên, đăng xuất
        (chuyển từ js/admin.js: getCurrentAdmin / requireAdminLogin / đăng xuất)
     2. Trang auth.html: đăng nhập khách, đăng ký khách, đăng nhập admin
        (chuyển từ js/login.js, js/register.js và form đăng nhập admin cũ)

   Trang admin nạp file này trong <head>, trước mọi script khác:
       <script src="../js/auth.js"></script>
       <script>requireAdminLogin();</script>

   LƯU Ý: dự án không có backend nên đây chỉ là bảo vệ phía trình duyệt
   (đủ cho bản demo). Muốn bảo mật thật phải kiểm tra ở server.
   ========================================================== */

/* ==================== 1. QUẢN TRỊ VIÊN ==================== */
(function (global) {
    "use strict";

    // Phải đọc ngay khi script đang chạy (sau đó document.currentScript sẽ là null)
    var scriptSrc = document.currentScript && document.currentScript.src;

    // auth.js nằm ở /js, còn auth.html và admin/admin.html tính từ gốc dự án,
    // nên trang nào nạp file này cũng ra đúng đường dẫn
    function fromRoot(path) {
        try {
            return new URL("../" + path, scriptSrc).href;
        } catch (e) {
            return (window.location.pathname.indexOf("/admin/") !== -1 ? "../" : "") + path;
        }
    }

    var AUTH_URL = fromRoot("auth.html");
    var ADMIN_URL = fromRoot("admin/admin.html");

    var SESSION_KEY = "adminSession";     // sessionStorage: tự mất khi đóng tab
    var RETURN_KEY = "adminReturnHash";   // chỉ lưu phần #hash, tránh open-redirect
    var SESSION_TTL = 2 * 60 * 60 * 1000; // 2 giờ

    // Tài khoản demo (không có backend để kiểm tra thật)
    var DEMO_USER = "admin";
    var DEMO_PASS = "12345678";

    function readSession() {
        try {
            var s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
            if (!s || s.user !== DEMO_USER || typeof s.expiresAt !== "number") return null;
            if (Date.now() >= s.expiresAt) {
                sessionStorage.removeItem(SESSION_KEY);
                return null;
            }
            return s;
        } catch (e) {
            return null;
        }
    }

    // Từ admin.js: getCurrentAdmin() - admin đã đăng nhập chưa
    function getCurrentAdmin() {
        return readSession() !== null;
    }

    // Từ admin.js: requireAdminLogin() - chưa đăng nhập thì chuyển về auth.html#admin
    function requireAdminLogin() {
        if (getCurrentAdmin()) return true;

        if (window.location.hash && window.location.hash.length > 1) {
            sessionStorage.setItem(RETURN_KEY, window.location.hash);
        }
        // Ẩn nội dung ngay để không nháy giao diện admin trước khi chuyển trang
        document.documentElement.style.visibility = "hidden";
        window.location.replace(AUTH_URL + "#admin");
        return false;
    }

    // Trả về true nếu đúng tài khoản và đã tạo phiên đăng nhập
    function adminLogin(username, password) {
        if (username !== DEMO_USER || password !== DEMO_PASS) return false;
        var now = Date.now();
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
            user: DEMO_USER,
            loginAt: now,
            expiresAt: now + SESSION_TTL
        }));
        // Xóa cờ cũ (bản trước lưu "adminLoggedIn" trong localStorage, rất dễ bị giả mạo)
        localStorage.removeItem("adminLoggedIn");
        return true;
    }

    // Từ admin.js: xử lý đăng xuất
    function adminLogout() {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(RETURN_KEY);
        localStorage.removeItem("adminLoggedIn");
        window.location.replace(AUTH_URL + "#admin");
    }

    // Lấy và xóa #hash đã lưu; chỉ nhận dạng #tên-trang (chữ, số, gạch) để an toàn
    function consumeReturnHash() {
        var h = sessionStorage.getItem(RETURN_KEY) || "";
        sessionStorage.removeItem(RETURN_KEY);
        return /^#[A-Za-z0-9_-]+$/.test(h) ? h : "#dashboard";
    }

    function goToAdmin() {
        window.location.replace(ADMIN_URL + consumeReturnHash());
    }

    // Quay lại bằng nút Back sau khi đăng xuất: trình duyệt có thể hiện trang admin từ cache
    window.addEventListener("pageshow", function (e) {
        if (e.persisted && document.body && document.body.hasAttribute("data-admin-page") && !getCurrentAdmin()) {
            requireAdminLogin();
        }
    });

    global.getCurrentAdmin = getCurrentAdmin;
    global.requireAdminLogin = requireAdminLogin;
    global.AdminAuth = {
        isLoggedIn: getCurrentAdmin,
        requireLogin: requireAdminLogin,
        login: adminLogin,
        logout: adminLogout,
        goToAdmin: goToAdmin
    };
})(window);


/* ==================== 2. TRANG auth.html ==================== */
(function () {
    "use strict";

    function init() {
        var page = document.getElementById("authPage");
        if (!page) return; // không phải trang auth.html (vd. admin.html chỉ cần phần 1)

        initRouter();
        initCustomerLogin();
        initRegister();
        initAdminLogin();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    /* ---------- Chuyển view theo #hash: #login | #register | #admin ---------- */
    function initRouter() {
        var VIEWS = {
            login: { title: "Đăng nhập - BookHub", tab: "customer" },
            register: { title: "Đăng ký tài khoản - BookHub", tab: "customer" },
            admin: { title: "Đăng nhập quản trị - BookHub", tab: "admin" }
        };

        function route() {
            var name = location.hash.replace("#", "").split("?")[0];
            var key = VIEWS[name] ? name : "login";

            // Admin đã đăng nhập mà vào lại thì cho vào thẳng khu quản trị
            if (key === "admin" && AdminAuth.isLoggedIn()) {
                AdminAuth.goToAdmin();
                return;
            }

            document.querySelectorAll("[data-view]").forEach(function (v) {
                v.hidden = v.id !== "view-" + key;
            });

            document.querySelectorAll("[data-tab]").forEach(function (t) {
                var active = t.getAttribute("data-tab") === VIEWS[key].tab;
                t.classList.toggle("active", active);
                if (active) t.setAttribute("aria-current", "page");
                else t.removeAttribute("aria-current");
            });

            document.title = VIEWS[key].title;
            window.scrollTo(0, 0);
        }

        window.addEventListener("hashchange", route);
        route();
    }

    /* ---------- Hiện / ẩn thông báo lỗi ---------- */
    function showError(el, message) {
        if (!el) return;
        el.style.display = "block";
        el.textContent = message;
    }

    function hideError(el) {
        if (!el) return;
        el.style.display = "none";
        el.textContent = "";
    }

    /* ---------- Đăng nhập khách hàng (từ js/login.js) ---------- */
    function initCustomerLogin() {
        var form = document.getElementById("customersLoginForm");
        if (!form) return;

        var userInput = document.getElementById("userName");
        var passInput = document.getElementById("password");
        var userError = document.getElementById("userError");
        var passError = document.getElementById("passwordError");

        // Kiểm tra địa chỉ quay lại: cùng website và không phải trang auth.html
        function isSafeReturnUrl(url) {
            if (!url) return false;

            try {
                var target = new URL(url, window.location.href);

                if (target.origin !== window.location.origin) return false;

                var page = target.pathname.split("/").pop().toLowerCase();
                return page !== "auth.html";
            } catch (error) {
                return false;
            }
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var isValid = true;

            // Validate dữ liệu đầu vào
            if (!userInput.value.trim()) {
                showError(userError, "Tên không được để trống");
                isValid = false;
            } else {
                hideError(userError);
            }

            if (!passInput.value.trim()) {
                showError(passError, "Mật khẩu không được để trống");
                isValid = false;
            } else {
                hideError(passError);
            }

            if (!isValid) return;

            // Lấy dữ liệu khách hàng từ localStorage
            var customers;
            try {
                customers = JSON.parse(localStorage.getItem("customers"));
            } catch (error) {
                customers = null;
            }
            if (!Array.isArray(customers)) customers = [];

            // Đối chiếu tên và mật khẩu
            var findUser = customers.find(function (c) {
                return c.userName === userInput.value.trim() &&
                       c.password === passInput.value.trim();
            });

            if (!findUser) {
                showError(passError, "Tên hoặc mật khẩu không đúng");
                return;
            }

            if (findUser.status === "inactive") {
                showError(passError, "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
                return;
            }

            // Lấy khóa giỏ hàng riêng của tài khoản
            var cartKey = "cart_" + findUser.customerId;

            // Chỉ chuyển dữ liệu cũ nếu chưa có giỏ hàng riêng
            if (localStorage.getItem(cartKey) === null) {
                try {
                    var allCarts = JSON.parse(localStorage.getItem("userCarts") || "{}");
                    var oldCart = allCarts[findUser.customerId];

                    if (oldCart && typeof oldCart === "object") {
                        localStorage.setItem(cartKey, JSON.stringify(oldCart));
                    }
                } catch (error) {
                    console.error("Lỗi chuyển dữ liệu giỏ cũ:", error);
                }
            }

            // Đăng nhập thành công
            localStorage.setItem("currentUser", JSON.stringify(findUser));

            var returnUrl = sessionStorage.getItem("returnUrl");
            sessionStorage.removeItem("returnUrl");

            // Quay lại trang đang xem trước khi đăng nhập (nếu địa chỉ hợp lệ)
            window.location.href = isSafeReturnUrl(returnUrl) ? returnUrl : "index.html#home";
        });

        userInput.addEventListener("input", function () {
            var value = userInput.value.trim();
            if (value === "") {
                userError.style.display = "block";
                userError.textContent = "Vui lòng nhập tên hiển thị";
            } else if (value.length < 2 || value.length > 30) {
                userError.style.display = "block";
                userError.textContent = "Tên hiển thị phải có ít nhất 2 ký tự và không quá 30 ký tự";
            } else {
                hideError(userError);
            }
        });

        passInput.addEventListener("input", function () {
            if (passInput.value.trim() === "") {
                passError.style.display = "block";
                passError.textContent = "Vui lòng nhập password";
            } else if (passInput.validity.tooShort) {
                passError.style.display = "block";
                passError.textContent = "Mật khẩu phải có ít nhất 8 ký tự";
            } else {
                hideError(passError);
            }
        });
    }

    /* ---------- Đăng ký khách hàng (từ js/register.js) ---------- */
    function initRegister() {
        var form = document.getElementById("formRegister");
        if (!form) return;

        var fullName = document.getElementById("fullName");
        var userName = document.getElementById("regUserName");
        var email = document.getElementById("email");
        var phone = document.getElementById("phone");
        var password = document.getElementById("regPassword");
        var repassword = document.getElementById("repassword");
        var address = document.getElementById("address");

        var nameError = document.getElementById("nameError");
        var usernameError = document.getElementById("usernameError");
        var emailError = document.getElementById("emailError");
        var phoneError = document.getElementById("phoneError");
        var passwordError = document.getElementById("regPasswordError");
        var repasswordError = document.getElementById("repasswordError");

        var EMAIL_RE = /^[^\s@]+@[^\s@]+\.com$/i;

        // Đọc danh sách khách hàng mới nhất (admin có thể vừa thêm / xóa ở tab khác)
        function readCustomers() {
            try {
                var list = JSON.parse(localStorage.getItem("customers"));
                return Array.isArray(list) ? list : [];
            } catch (error) {
                return [];
            }
        }

        // Tạo mã KHxxxxxxxx = số lớn nhất đang có + 1
        // (không dùng "số lượng + 1" vì xóa khách rồi đăng ký mới sẽ trùng mã)
        function createCustomerId(customers) {
            var max = customers.reduce(function (m, c) {
                var n = parseInt(String((c && c.customerId) || "").replace(/^KH/i, ""), 10);
                return !isNaN(n) && n > m ? n : m;
            }, 0);
            return "KH" + String(max + 1).padStart(8, "0");
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            var isValid = true;

            if (!fullName.value.trim()) {
                showError(nameError, "Tên không được để trống");
                isValid = false;
            } else {
                hideError(nameError);
            }

            if (!userName.value.trim()) {
                showError(usernameError, "Tên không được để trống");
                isValid = false;
            } else {
                hideError(usernameError);
            }

            if (!email.value.trim()) {
                showError(emailError, "Email không được để trống");
                isValid = false;
            } else if (!EMAIL_RE.test(email.value.trim())) {
                showError(emailError, "Email không đúng định dạng");
                isValid = false;
            } else {
                hideError(emailError);
            }

            if (!phone.value.trim()) {
                showError(phoneError, "Số điện thoại không được để trống");
                isValid = false;
            } else {
                hideError(phoneError);
            }

            if (!password.value.trim()) {
                showError(passwordError, "Mật khẩu không được để trống");
                isValid = false;
            } else if (password.value.length < 8) {
                showError(passwordError, "Mật khẩu phải có ít nhất 8 ký tự");
                isValid = false;
            } else {
                hideError(passwordError);
            }

            if (!repassword.value.trim()) {
                showError(repasswordError, "Vui lòng nhập mật khẩu");
                isValid = false;
            } else if (password.value !== repassword.value) {
                showError(repasswordError, "Mật khẩu không khớp");
                isValid = false;
            } else {
                hideError(repasswordError);
            }

            if (!isValid) return;

            var customers = readCustomers();

            // Kiểm tra trùng tên hiển thị
            var exists = customers.some(function (c) {
                return String(c.userName).toLowerCase() === userName.value.trim().toLowerCase();
            });
            if (exists) {
                showError(usernameError, "Tên hiển thị đã được sử dụng");
                return;
            }

            customers.push({
                customerId: createCustomerId(customers),
                fullName: fullName.value.trim(),
                userName: userName.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                password: password.value.trim(),
                address: address.value,
                status: "active"
            });

            localStorage.setItem("customers", JSON.stringify(customers));

            // Khóa nút để tránh bấm nhiều lần
            var submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            // Chuyển sang đăng nhập
            setTimeout(function () {
                form.reset();
                if (submitBtn) submitBtn.disabled = false;
                window.location.hash = "#login";
            }, 500);
        });

        fullName.addEventListener("input", function () {
            var wordCount = fullName.value.trim().split(/\s+/).filter(function (w) { return w !== ""; }).length;

            if (fullName.value === "") {
                nameError.style.display = "block";
                nameError.textContent = "Vui lòng nhập họ và tên";
            } else if (fullName.value.length < 2) {
                nameError.style.display = "block";
                nameError.textContent = "Họ và tên phải có ít nhất 2 ký tự";
            } else if (wordCount < 2) {
                nameError.style.display = "block";
                nameError.textContent = "Vui lòng nhập đầy đủ cả họ và tên (ít nhất 2 từ)";
            } else {
                hideError(nameError);
            }
        });

        userName.addEventListener("input", function () {
            var value = userName.value.trim();
            if (value === "") {
                usernameError.style.display = "block";
                usernameError.textContent = "Vui lòng nhập tên hiển thị";
            } else if (value.length < 2 || value.length > 30) {
                usernameError.style.display = "block";
                usernameError.textContent = "Tên hiển thị phải có ít nhất 2 ký tự và không quá 30 ký tự";
            } else {
                hideError(usernameError);
            }
        });

        email.addEventListener("input", function () {
            if (email.value.trim() === "") {
                emailError.style.display = "block";
                emailError.textContent = "Vui lòng nhập email";
            } else if (!EMAIL_RE.test(email.value.trim())) {
                emailError.style.display = "block";
                emailError.textContent = "Email không đúng định dạng";
            } else {
                hideError(emailError);
            }
        });

        phone.addEventListener("input", function () {
            if (!/^0[0-9]{9}$/.test(phone.value)) {
                phoneError.style.display = "block";
                phoneError.textContent = "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0";
            } else {
                hideError(phoneError);
            }
        });

        password.addEventListener("input", function () {
            if (password.value.trim() === "") {
                passwordError.style.display = "block";
                passwordError.textContent = "Vui lòng nhập password";
            } else if (password.value.length < 8) {
                passwordError.style.display = "block";
                passwordError.textContent = "Mật khẩu phải có ít nhất 8 ký tự";
            } else {
                hideError(passwordError);
            }
        });

        repassword.addEventListener("input", function () {
            if (repassword.value.trim() === "") {
                repasswordError.style.display = "block";
                repasswordError.textContent = "Vui lòng nhập lại mật khẩu";
            } else if (password.value !== repassword.value) {
                repasswordError.style.display = "block";
                repasswordError.textContent = "Mật khẩu không khớp";
            } else {
                hideError(repasswordError);
            }
        });
    }

    /* ---------- Đăng nhập quản trị viên ---------- */
    function initAdminLogin() {
        var form = document.getElementById("adminLoginForm");
        if (!form) return;

        var userInput = document.getElementById("adminUsername");
        var passInput = document.getElementById("adminPassword");
        var userError = document.getElementById("adminUserError");
        var passError = document.getElementById("adminPasswordError");

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var username = userInput.value.trim();
            var password = passInput.value;
            var isValid = true;

            if (!username) {
                showError(userError, "Tên không được để trống");
                isValid = false;
            } else {
                hideError(userError);
            }

            if (password.trim() === "") {
                showError(passError, "Mật khẩu không được để trống");
                isValid = false;
            } else {
                hideError(passError);
            }

            if (!isValid) return;

            if (AdminAuth.login(username, password)) {
                passInput.value = "";
                AdminAuth.goToAdmin();
            } else {
                showError(passError, "Tài khoản hoặc mật khẩu không đúng");
                passInput.select();
            }
        });

        // Xóa thông báo lỗi khi người dùng bắt đầu sửa
        userInput.addEventListener("input", function () { hideError(userError); });
        passInput.addEventListener("input", function () { hideError(passError); });
    }
})();
