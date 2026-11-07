/* ==========================================================
   BOOKHUB - admin-auth.js
   Xác thực quản trị viên, dùng chung cho:
     - admin/auth.html  (trang đăng nhập duy nhất)
     - admin/*.html     (mọi trang trong thư mục admin)

   Cách dùng ở trang admin (đặt TRONG <head>, trước mọi script khác):
       <script src="../js/admin-auth.js"></script>
       <script>AdminAuth.requireLogin();</script>

   LƯU Ý: dự án không có backend nên đây chỉ là bảo vệ phía trình
   duyệt (đủ cho bản demo). Muốn bảo mật thật phải kiểm tra ở server.
   ========================================================== */
(function (global) {
    "use strict";

    var AUTH_PAGE = "auth.html";          // nằm cùng thư mục admin/
    var ADMIN_HOME = "admin.html#dashboard";        // trang đích sau khi đăng nhập
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

    function isLoggedIn() {
        return readSession() !== null;
    }

    // Trả về true nếu đúng tài khoản và đã tạo phiên đăng nhập
    function login(username, password) {
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

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(RETURN_KEY);
        localStorage.removeItem("adminLoggedIn");
        window.location.replace(AUTH_PAGE);
    }

    // Gọi ở đầu mỗi trang admin: chưa đăng nhập thì chuyển về auth.html
    function requireLogin() {
        if (isLoggedIn()) return true;
        if (window.location.hash && window.location.hash.length > 1) {
            sessionStorage.setItem(RETURN_KEY, window.location.hash);
        }
        // Ẩn nội dung ngay để không nháy giao diện admin trước khi chuyển trang
        document.documentElement.style.visibility = "hidden";
        window.location.replace(AUTH_PAGE);
        return false;
    }

    // Dùng ở auth.html: đã đăng nhập rồi thì vào thẳng admin
    function redirectIfLoggedIn() {
        if (isLoggedIn()) {
            window.location.replace(ADMIN_HOME + consumeReturnHash());
            return true;
        }
        return false;
    }

    // Lấy và xóa #hash đã lưu; chỉ nhận dạng #tên-trang (chữ, số, gạch) để an toàn
    function consumeReturnHash() {
        var h = sessionStorage.getItem(RETURN_KEY) || "";
        sessionStorage.removeItem(RETURN_KEY);
        return /^#[A-Za-z0-9_-]+$/.test(h) ? h : "#dashboard";
    }

    function goToAdmin() {
        window.location.replace(ADMIN_HOME + consumeReturnHash());
    }

    // Quay lại bằng nút Back sau khi đăng xuất: trình duyệt có thể hiện trang admin từ cache
    window.addEventListener("pageshow", function (e) {
        if (e.persisted && document.body && document.body.hasAttribute("data-admin-page") && !isLoggedIn()) {
            requireLogin();
        }
    });

    global.AdminAuth = {
        isLoggedIn: isLoggedIn,
        login: login,
        logout: logout,
        requireLogin: requireLogin,
        redirectIfLoggedIn: redirectIfLoggedIn,
        goToAdmin: goToAdmin
    };
})(window);
document.querySelectorAll(".togglePassword").forEach(button => {
        // Lấy input tương ứng thông qua data-target
        const input = document.getElementById(button.dataset.target);

        // Nếu không tìm thấy input thì bỏ qua
        if (!input) return;

        // Hiện mật khẩu
        function showPassword() {
            input.type = "text";
            button.classList.add("is-visible");
        }

        // Ẩn mật khẩu
        function hidePassword() {
            input.type = "password";
            button.classList.remove("is-visible");
        }

        // Nhấn chuột hoặc chạm màn hình
        button.addEventListener("pointerdown", function(event) {
            event.preventDefault();

            showPassword();
            button.setPointerCapture(event.pointerId);
        });

        // Thả chuột hoặc ngón tay
        button.addEventListener("pointerup", hidePassword);

        // Khi thao tác bị hủy
        button.addEventListener("pointercancel", hidePassword);

        // Khi mất quyền theo dõi pointer
        button.addEventListener("lostpointercapture", hidePassword);

        // Khi cửa sổ mất focus
        window.addEventListener("blur", hidePassword);

        // Hỗ trợ bàn phím
        button.addEventListener("keydown", function(event) {
            if (
                (event.key === " " || event.key === "Enter") &&
                !event.repeat
            ) {
                event.preventDefault();
                showPassword();
            }
        });

        button.addEventListener("keyup", function(event) {
            if (event.key === " " || event.key === "Enter") {
                hidePassword();
            }
        });

        button.addEventListener("blur", hidePassword);
});
