document.addEventListener("DOMContentLoaded", function () {

    // Khóa localStorage 
    const customersKey = "customers";
    const currentUserKey = "currentUser";

    // Lấy các phần tử HTML
    const get = id => document.getElementById(id);

    const form = get("profileForm");
    const message = get("profileMessage");

    // Các ô được chỉnh sửa: id trên form -> tên thuộc tính trong dữ liệu
    const editableFields = {
        username: "userName",
        email: "email",
        phone: "phone",
        address: "address"
    };

    let customer = null;
    let isEditing = false;

    // Đọc danh sách khách hàng
    function getCustomers() {
        try {
            return JSON.parse(localStorage.getItem(customersKey)) || [];
        } catch (error) {
            console.error("Lỗi đọc danh sách khách hàng:", error);
            return [];
        }
    }

    // Lấy thông tin tài khoản đang đăng nhập
    function loadProfile() {
        try {
            const currentUser = localStorage.getItem(currentUserKey);

            if (!currentUser) {
                customer = null;
                return;
            }

            customer = JSON.parse(currentUser);

        } catch (error) {
            console.error("Lỗi đọc thông tin tài khoản:", error);
            customer = null;
        }
    }

    // Hiển thị thông báo
    function showMessage(text, error = false, massage = "profileMessage") {
        const message = get(massage);
        message.textContent = text;
        message.hidden = !text;
        message.className = error ? "out-stock" : "in-stock";
    }
    // Hiển thị thông báo xóa tài khoản hoặc đổi mật khẩu
    function showDeleteMessage(text, massage = "profileMessage") {
        const message = get(massage);
        message.textContent = text;
        message.hidden = false;
        message.className = "out-stock";
    }
    // Bật hoặc tắt chế độ chỉnh sửa
    function setEditing(value) {
        isEditing = Boolean(value && customer);

        Object.keys(editableFields).forEach(id => {
            get(id).readOnly = !isEditing;
        });

        get("editWrapper").hidden = isEditing || !customer;
        get("profileActions").hidden = !isEditing;
    }

    // Hiển thị thông tin hồ sơ
    function renderProfile() {

        if (!customer) {
            get("customerId").value = "";
            get("username").value = "";
            get("fullName").value = "";
            get("email").value = "";
            get("phone").value = "";
            get("address").value = "";

            get("sidebarFullName").textContent = "Chưa đăng nhập";
            get("sidebarUsername").textContent = "Vui lòng đăng nhập";
            get("profileAvatar").textContent = "BH";

            get("editWrapper").hidden = true;
            get("profileActions").hidden = true;

            showDeleteMessage("Vui lòng đăng nhập để xem hồ sơ.", true);
            return;
        }

        get("customerId").value = customer.customerId || "";
        get("username").value = customer.userName || "";
        get("fullName").value = customer.fullName || "";
        get("email").value = customer.email || "";
        get("phone").value = customer.phone || "";
        get("address").value = customer.address || "";

        // Thông tin cột trái
        get("sidebarFullName").textContent =
            customer.fullName || "Khách hàng";

        get("sidebarUsername").textContent =
            "@" + (customer.userName || "");

        // Tạo avatar từ họ tên
        const words = (customer.fullName || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        // Lấy chữ cái đầu của 2 từ cuối (tên đệm + tên)
        let avatar = "BH";

        if (words.length >= 2) {
            avatar = Array.from(words[words.length - 2])[0] +
                     Array.from(words[words.length - 1])[0];
        } else if (words.length === 1) {
            avatar = Array.from(words[0]).slice(0, 2).join("");
        }

        get("profileAvatar").textContent =
            avatar.toLocaleUpperCase("vi-VN");
    }

    // Nút chỉnh sửa
    get("editProfileBtn").addEventListener("click", function () {
        if (!customer) return;

        setEditing(true);
        showDeleteMessage("");
        get("username").focus();
    });

    // Nút hủy
    get("cancelProfileBtn").addEventListener("click", function () {
        setEditing(false);
        renderProfile();   // đưa dữ liệu về như cũ
        showDeleteMessage("Đã hủy thay đổi.");
    });

    // Lưu thay đổi
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!customer || !isEditing) return;

        if (!form.reportValidity()) return;

        const changes = {};

        Object.entries(editableFields).forEach(([id, key]) => {
            changes[key] = get(id).value.trim();
        });

        // Kiểm tra tên đăng nhập
        if (changes.userName.length < 2 || changes.userName.length > 30) {
            showDeleteMessage("Tên đăng nhập phải từ 2 đến 30 ký tự.", true);
            return;
        }

        // Kiểm tra email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email)) {
            showDeleteMessage("Email không hợp lệ.", true);
            return;
        }

        // Kiểm tra số điện thoại
        if (!/^0\d{9}$/.test(changes.phone)) {
            showDeleteMessage(
                "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.",
                true
            );
            return;
        }

        const customers = getCustomers();

        // Tìm vị trí khách hàng trong danh sách
        const index = customers.findIndex(
            item => item.customerId === customer.customerId
        );

        if (index === -1) {
            showDeleteMessage("Không tìm thấy tài khoản trong hệ thống.", true);
            return;
        }

        // Kiểm tra tên đăng nhập trùng với tài khoản khác
        const userNameExists = customers.some(item =>
            item.customerId !== customer.customerId &&
            (item.userName || "").toLowerCase() === changes.userName.toLowerCase()
        );

        if (userNameExists) {
            showDeleteMessage("Tên đăng nhập đã được sử dụng.", true);
            return;
        }

        // Kiểm tra email trùng với tài khoản khác
        const emailExists = customers.some(item =>
            item.customerId !== customer.customerId &&
            (item.email || "").toLowerCase() === changes.email.toLowerCase()
        );

        if (emailExists) {
            showDeleteMessage("Email đã được sử dụng.", true);
            return;
        }

        // Cập nhật thông tin khách hàng
        const updatedCustomer = {
            ...customers[index],
            ...changes
        };

        customers[index] = updatedCustomer;

        try {
            // Lưu danh sách khách hàng
            localStorage.setItem(customersKey, JSON.stringify(customers));

            // Cập nhật luôn tài khoản đang đăng nhập
            localStorage.setItem(currentUserKey, JSON.stringify(updatedCustomer));

            customer = updatedCustomer;

            setEditing(false);
            renderProfile();

            showDeleteMessage("Cập nhật thông tin thành công!");

        } catch (error) {
            console.error("Lỗi lưu hồ sơ:", error);
            showDeleteMessage("Không thể lưu thông tin.", true);
        }
    });

    // ================= Đổi mật khẩu ==================

get("changePasswordForm").addEventListener("submit", function (event) {

    event.preventDefault();

    if (!customer) {
        showDeleteMessage("Vui lòng đăng nhập để đổi mật khẩu.", "passwordMessage");
        return;
    }

    const currentPassword = get("currentPassword").value;
    const newPassword = get("newPassword").value;
    const confirmPassword = get("confirmNewPassword").value;

    const currentSession = JSON.parse(
        localStorage.getItem(currentUserKey) || "null"
    );

    if (
        !currentSession ||
        currentSession.customerId !== customer.customerId
    ) {
        showDeleteMessage("Phiên đăng nhập không hợp lệ.", "passwordMessage");
        return;
    }

    const customers = getCustomers();

    const index = customers.findIndex(
        c => c.customerId === customer.customerId
    );

    if (index === -1 || customers[index].status === "inactive") {
        showDeleteMessage("Tài khoản không tồn tại hoặc đã bị khóa.", "passwordMessage");
        return;
    }

    if (currentPassword !== customers[index].password) {
        showDeleteMessage("Mật khẩu không chính xác!", "passwordMessage");
        return;
    }

    if (newPassword === customers[index].password) {
        showDeleteMessage("Mật khẩu mới phải khác mật khẩu hiện tại.", "passwordMessage");
        return;
    }

    if (newPassword.length < 8) {
        showDeleteMessage("Mật khẩu mới phải có ít nhất 8 ký tự.", "passwordMessage");
        return;
    }

    if (newPassword !== confirmPassword) {
        showDeleteMessage("Mật khẩu xác nhận không khớp.", "passwordMessage");
        return;
    }

    const confirmed = window.confirm(
            "Bạn có chắc chắn muốn ĐỔI MẬT KHẨU?\n" +
            "Sau khi đổi, bạn sẽ không thể đăng nhập lại với mật khẩu cũ."
        );

    if (!confirmed) return;
    customers[index].password = newPassword;

    localStorage.setItem("customers", JSON.stringify(customers));


    showDeleteMessage("Đổi mật khẩu thành công!", "passwordMessage");
    get("changePasswordForm").reset();
});
    
// ================= XÓA TÀI KHOẢN =================

    get("deleteAccountForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const password = get("deleteAccountPassword").value;

        // Kiểm tra tài khoản đang đăng nhập
        if (!customer) {
            showDeleteMessage("Vui lòng đăng nhập để xóa tài khoản.");
            return;
        }

        const currentSession = JSON.parse(
            localStorage.getItem(currentUserKey) || "null"
        );

        if (!currentSession ||
            currentSession.customerId !== customer.customerId) {
            showDeleteMessage("Phiên đăng nhập không hợp lệ.");
            return;
        }

        // Lấy dữ liệu tài khoản mới nhất
        const customers = getCustomers();

        const index = customers.findIndex(
            c => c.customerId === customer.customerId
        );

        if (index === -1 || customers[index].status === "inactive") {
            showDeleteMessage("Tài khoản không tồn tại hoặc đã bị khóa.");
            return;
        }

        // Bắt buộc nhập đúng mật khẩu hiện tại
        if (password !== customers[index].password) {
            showDeleteMessage("Mật khẩu không chính xác!");
            return;
        }

        // Xác nhận lần cuối
        const confirmed = window.confirm(
            "Bạn có chắc chắn muốn XÓA TÀI KHOẢN?\n" +
            "Sau khi xóa, bạn sẽ không thể đăng nhập lại."
        );

        if (!confirmed) return;

        const customerId = customer.customerId;

        try {
            // Xóa tài khoản khỏi danh sách khách hàng
            customers.splice(index, 1);

            localStorage.setItem(
                customersKey,
                JSON.stringify(customers)
            );

            // Xóa giỏ hàng đã lưu của khách hàng
            try {
                const userCarts = JSON.parse(
                    localStorage.getItem("userCarts") || "{}"
                );

                if (userCarts && typeof userCarts === "object") {
                    delete userCarts[customerId];

                    localStorage.setItem(
                        "userCarts",
                        JSON.stringify(userCarts)
                    );
                }
            } catch (error) {
                console.warn("Không thể dọn giỏ hàng:", error);
            }

            // Xóa phiên đăng nhập hiện tại
            localStorage.removeItem(currentUserKey);
            localStorage.removeItem("cart");

            // Xóa trang quay lại đã lưu
            sessionStorage.removeItem("returnUrl");

            alert("Tài khoản đã được xóa thành công!");

            // Chuyển về trang đăng nhập
            window.location.replace(getAuthUrl("login"));

        } catch (error) {
            console.error("Lỗi xóa tài khoản:", error);

            showDeleteMessage(
                "Không thể xóa tài khoản. Vui lòng thử lại."
            );
        }
    });
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

    // Khởi tạo trang
    loadProfile();
    setEditing(false);
    renderProfile();

});