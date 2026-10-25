document.addEventListener("DOMContentLoaded", function () {

    // Khóa localStorage (phải trùng với register.js / login.js)
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
    function showMessage(text, error = false) {
        message.textContent = text;
        message.hidden = !text;
        message.className = error ? "out-stock" : "in-stock";
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

            showMessage("Vui lòng đăng nhập để xem hồ sơ.", true);
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

        // Lấy chữ cái đầu của 2 từ cuối (tên đệm + tên): "Bá Khang" -> BK
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
        showMessage("");
        get("username").focus();
    });

    // Nút hủy
    get("cancelProfileBtn").addEventListener("click", function () {
        setEditing(false);
        renderProfile();   // đưa dữ liệu về như cũ
        showMessage("Đã hủy thay đổi.");
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
            showMessage("Tên đăng nhập phải từ 2 đến 30 ký tự.", true);
            return;
        }

        // Kiểm tra email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email)) {
            showMessage("Email không hợp lệ.", true);
            return;
        }

        // Kiểm tra số điện thoại
        if (!/^0\d{9}$/.test(changes.phone)) {
            showMessage(
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
            showMessage("Không tìm thấy tài khoản trong hệ thống.", true);
            return;
        }

        // Kiểm tra tên đăng nhập trùng với tài khoản khác
        const userNameExists = customers.some(item =>
            item.customerId !== customer.customerId &&
            (item.userName || "").toLowerCase() === changes.userName.toLowerCase()
        );

        if (userNameExists) {
            showMessage("Tên đăng nhập đã được sử dụng.", true);
            return;
        }

        // Kiểm tra email trùng với tài khoản khác
        const emailExists = customers.some(item =>
            item.customerId !== customer.customerId &&
            (item.email || "").toLowerCase() === changes.email.toLowerCase()
        );

        if (emailExists) {
            showMessage("Email đã được sử dụng.", true);
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

            showMessage("Cập nhật thông tin thành công!");

        } catch (error) {
            console.error("Lỗi lưu hồ sơ:", error);
            showMessage("Không thể lưu thông tin.", true);
        }
    });

    // Khởi tạo trang
    loadProfile();
    setEditing(false);
    renderProfile();

});