
/* ==========================================================
   BOOKHUB - ADMIN CUSTOMERS
   Quản lý tài khoản khách hàng đã đăng ký
   Dữ liệu dùng chung: localStorage["customers"]
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const storageKey = "customers";
    const pageSize = 7;
    const get = id => document.getElementById(id);

    let currentPage = 1;
    let selectedId = null;
    let isEditing = false;
    let resetId = null;

    // ================= ĐỌC / GHI DỮ LIỆU =================

    function getCustomers() {
        try {
            const data = JSON.parse(
                localStorage.getItem(storageKey) || "[]"
            );

            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function saveCustomers(customers) {
        localStorage.setItem(
            storageKey,
            JSON.stringify(customers)
        );
    }

    // Hỗ trợ tên thuộc tính ở các bản code cũ
    function getCustomerId(customer) {
        return String(
            customer.customerId ?? customer.customerID ?? ""
        );
    }

    function getUsername(customer) {
        return String(
            customer.userName ?? customer.username ?? ""
        );
    }

    // Tài khoản cũ chưa có status được xem là hoạt động
    function isActive(customer) {
        return customer.status !== "inactive";
    }

    // ================= HÀM HỖ TRỢ =================

    function showNotice(id, text) {
        const notice = get(id);
        notice.textContent = text;
        notice.hidden = !text;
    }

    function addCell(row, value) {
        const cell = row.insertCell();
        cell.textContent = String(value ?? "");
        return cell;
    }

    function makeButton(text, action, id, className = "") {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "btn btn-small " + className;
        button.textContent = text;

        button.dataset.action = action;
        button.dataset.id = id;

        return button;
    }

    // ================= HIỂN THỊ KHÁCH HÀNG =================

    function renderCustomers() {
        // Mỗi lần hiển thị đều đọc lại localStorage
        const customers = getCustomers();

        const keyword = get("customerSearch")
            .value.trim().toLowerCase();

        const filter = get("customerFilter").value;

        // ---------- THỐNG KÊ ----------

        const total = customers.length;

        const active = customers.filter(
            customer => isActive(customer)
        ).length;

        const locked = customers.filter(
            customer => !isActive(customer)
        ).length;

        get("totalCustomers").textContent = total;
        get("activeCustomers").textContent = active;
        get("lockedCustomers").textContent = locked;

        // ---------- TÌM KIẾM / LỌC ----------

        const filtered = customers.filter(customer => {

            const status = isActive(customer)
                ? "active"
                : "inactive";

            const matchesStatus =
                filter === "all" || filter === status;

            const searchText = [
                getCustomerId(customer),
                getUsername(customer),
                customer.fullName,
                customer.email,
                customer.phone
            ].map(value => String(value ?? ""))
             .join(" ")
             .toLowerCase();

            return matchesStatus &&
                searchText.includes(keyword);
        });

        // ---------- PHÂN TRANG ----------

        const totalPages = Math.max(
            1,
            Math.ceil(filtered.length / pageSize)
        );

        currentPage = Math.max(
            1,
            Math.min(currentPage, totalPages)
        );

        const start = (currentPage - 1) * pageSize;

        const displayed = filtered.slice(
            start,
            start + pageSize
        );

        get("pageInfo").textContent =
            `${currentPage} / ${totalPages}`;

        get("customerCount").textContent =
            `${filtered.length} khách hàng`;

        get("prevBtn").disabled = currentPage === 1;
        get("nextBtn").disabled = currentPage === totalPages;

        // ---------- HIỂN THỊ BẢNG ----------

        const tbody = get("customerList");

        tbody.replaceChildren();

        if (displayed.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell();

            cell.colSpan = 7;
            cell.className = "empty";
            cell.textContent =
                "Chưa có khách hàng hoặc không có kết quả phù hợp.";

            return;
        }

        displayed.forEach(customer => {
            const row = tbody.insertRow();

            const id = getCustomerId(customer);

            addCell(row, id);
            addCell(row, getUsername(customer));
            addCell(row, customer.fullName);
            addCell(row, customer.email);
            addCell(row, customer.phone);

            // Cột trạng thái
            const statusCell = row.insertCell();
            const badge = document.createElement("span");

            badge.className = "badge " +
                (isActive(customer)
                    ? "badge-active"
                    : "badge-inactive");

            badge.textContent = isActive(customer)
                ? "Hoạt động"
                : "Đã khóa";

            statusCell.append(badge);

            // Cột thao tác
            const actionCell = row.insertCell();
            const actions = document.createElement("div");

            actions.className = "actions";

            actions.append(
                makeButton("Xem", "view", id),

                makeButton(
                    "Đổi MK",
                    "reset-password",
                    id,
                    "btn-warning"
                ),

                isActive(customer)
                    ? makeButton(
                        "Khóa",
                        "toggle",
                        id,
                        "btn-danger"
                    )
                    : makeButton(
                        "Mở khóa",
                        "toggle",
                        id,
                        "btn-warning"
                    )
            );

            actionCell.append(actions);
        });
    }

    // ================= MODAL KHÁCH HÀNG =================

    function setEditing(value) {
        isEditing = value;

        ["fullName", "email", "phone", "address"]
            .forEach(id => {
                get(id).readOnly = !value;
            });

        get("editBtn").hidden = value;
        get("saveBtn").hidden = !value;

        get("modalTitle").textContent = value
            ? "Chỉnh sửa khách hàng"
            : "Thông tin khách hàng";
    }

    function openModal(id, editMode = false) {

        const customer = getCustomers().find(
            c => getCustomerId(c) === id
        );

        if (!customer) return;

        selectedId = id;

        get("customerId").value = id;
        get("userName").value = getUsername(customer);
        get("fullName").value = customer.fullName || "";
        get("email").value = customer.email || "";
        get("phone").value = customer.phone || "";
        get("address").value = customer.address || "";

        get("customerStatus").value = isActive(customer)
            ? "Hoạt động"
            : "Đã khóa";

        setEditing(editMode);
        showNotice("modalNotice", "");

        get("customerModal").classList.add("show");

        get("customerModal").setAttribute(
            "aria-hidden",
            "false"
        );

        if (editMode) {
            get("fullName").focus();
        }
    }

    function closeModal() {
        get("customerModal").classList.remove("show");

        get("customerModal").setAttribute(
            "aria-hidden",
            "true"
        );

        selectedId = null;
        isEditing = false;
    }

    // ================= KHÓA / MỞ KHÓA =================

    function toggleStatus(id) {
        const customers = getCustomers();

        const customer = customers.find(
            c => getCustomerId(c) === id
        );

        if (!customer) return;

        const active = isActive(customer);

        const action = active ? "khóa" : "mở khóa";

        const confirmed = confirm(
            `Bạn có muốn ${action} tài khoản ${id}?`
        );

        if (!confirmed) return;

        customer.status = active
            ? "inactive"
            : "active";

        try {
            saveCustomers(customers);

            renderCustomers();

            showNotice(
                "customerNotice",
                `Đã ${action} tài khoản ${id}.`
            );

        } catch {
            showNotice(
                "customerNotice",
                "Không thể cập nhật trạng thái."
            );
        }
    }

    // ================= LƯU THÔNG TIN KHÁCH HÀNG =================

    get("customerForm").addEventListener("submit", event => {
        event.preventDefault();

        if (!isEditing || !selectedId) return;

        if (!get("customerForm").reportValidity()) return;

        const fullName = get("fullName").value.trim();
        const email = get("email").value.trim();
        const phone = get("phone").value
            .trim().replace(/\s/g, "");
        const address = get("address").value.trim();

        // Kiểm tra họ tên
        if (fullName.length < 2) {
            showNotice(
                "modalNotice",
                "Họ tên phải có ít nhất 2 ký tự."
            );
            return;
        }

        // Đồng bộ với quy tắc đăng ký
        if (!/^0\d{9}$/.test(phone)) {
            showNotice(
                "modalNotice",
                "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0."
            );
            return;
        }

        const customers = getCustomers();

        const index = customers.findIndex(
            c => getCustomerId(c) === selectedId
        );

        if (index === -1) {
            showNotice(
                "modalNotice",
                "Không tìm thấy khách hàng."
            );
            return;
        }

        // Kiểm tra email đã được dùng chưa
        const duplicateEmail = customers.some(c =>
            getCustomerId(c) !== selectedId &&
            String(c.email || "").toLowerCase() ===
                email.toLowerCase()
        );

        if (duplicateEmail) {
            showNotice(
                "modalNotice",
                "Email đã được sử dụng."
            );
            return;
        }

        // Chỉ cập nhật thông tin được phép sửa
        const updated = {
            ...customers[index],
            fullName,
            email,
            phone,
            address
        };

        customers[index] = updated;

        try {
            // Lưu danh sách khách hàng
            saveCustomers(customers);

            // Đồng bộ nếu đang đăng nhập tài khoản này
            try {
                const currentUser = JSON.parse(
                    localStorage.getItem("currentUser") || "null"
                );

                if (
                    currentUser &&
                    getCustomerId(currentUser) === selectedId
                ) {
                    localStorage.setItem(
                        "currentUser",
                        JSON.stringify(updated)
                    );
                }
            } catch {
                // Không ảnh hưởng việc lưu khách hàng
            }

            closeModal();
            renderCustomers();

            showNotice(
                "customerNotice",
                "Cập nhật khách hàng thành công!"
            );

        } catch {
            showNotice(
                "modalNotice",
                "Không thể lưu thông tin khách hàng."
            );
        }
    });

    // Admin đặt lại mật khẩu không cần mật khẩu cũ.
    function openReset(id) {
        const c = getCustomers().find(x => getCustomerId(x) === id);
        if (!c) return;
        resetId = id;
        get("resetPasswordForm").reset();
        get("resetCustomerName").textContent = `${getUsername(c)} (${id})`;
        showNotice("resetPasswordNotice", "");
        get("resetPasswordModal").classList.add("show");
        get("resetPasswordModal").setAttribute("aria-hidden", "false");
        get("adminNewPassword").focus();
    }

    function closeReset() {
        get("resetPasswordModal").classList.remove("show");
        get("resetPasswordModal").setAttribute("aria-hidden", "true");
        get("resetPasswordForm").reset();
        resetId = null;
    }

    get("resetPasswordForm").addEventListener("submit", event => {
        event.preventDefault();
        if (!resetId || !get("resetPasswordForm").reportValidity()) return;
        const newPassword = get("adminNewPassword").value;
        const confirmPassword = get("adminConfirmPassword").value;
        if (newPassword.length < 8 || !newPassword.trim()) {
            showNotice("resetPasswordNotice", "Mật khẩu mới phải dài ít nhất 8 ký tự.");
            return;
        }
        if (newPassword !== confirmPassword) {
            showNotice("resetPasswordNotice", "Hai lần nhập mật khẩu không khớp.");
            return;
        }
        const customers = getCustomers();
        const index = customers.findIndex(c => getCustomerId(c) === resetId);
        if (index < 0) return showNotice("resetPasswordNotice", "Không tìm thấy tài khoản.");
        if (customers[index].password === newPassword) {
            showNotice("resetPasswordNotice", "Mật khẩu mới phải khác mật khẩu cũ.");
            return;
        }
        const id = resetId;
        customers[index] = { ...customers[index], password: newPassword };
        try {
            saveCustomers(customers);
            // Đăng xuất Customer hiện tại nếu chính tài khoản đó bị đặt lại mật khẩu.
            const current = JSON.parse(localStorage.getItem("currentUser") || "null");
            if (current && getCustomerId(current) === id)
                localStorage.removeItem("currentUser");
            closeReset();
            showNotice("customerNotice", `Đã đặt lại mật khẩu cho ${id}.`);
        } catch (error) {
            showNotice("resetPasswordNotice", "Không thể lưu mật khẩu.");
        }
    });

    // ================= SỰ KIỆN THAO TÁC =================

    // Nút Xem / Sửa / Khóa trong bảng
    get("customerList").addEventListener("click", event => {

        const button = event.target.closest(
            "button[data-action]"
        );

        if (!button) return;

        const { action, id } = button.dataset;

        if (action === "view") {
            openModal(id);
        }
        if (action === "toggle") {
            toggleStatus(id);
        }
        if (action === "reset-password"){
            openReset(id);
        }
    });

    // Nút chỉnh sửa trong Modal
    get("editBtn").addEventListener("click", () => {
        setEditing(true);
        get("fullName").focus();
    });

    // Đóng Modal
    get("closeModalBtn").addEventListener(
        "click",
        closeModal
    );

    get("cancelBtn").addEventListener(
        "click",
        closeModal
    );

    // Đóng hộp thoại đổi mật khẩu
    get("closeResetBtn").addEventListener("click", closeReset);

    get("cancelResetBtn").addEventListener("click", closeReset);

    get("resetPasswordModal").addEventListener("click", event => {
        if (event.target === get("resetPasswordModal")) {
            closeReset();
        }
    });

    // Tìm kiếm
    get("customerSearch").addEventListener("input", () => {
        currentPage = 1;
        renderCustomers();
    });

    // Lọc theo trạng thái
    get("customerFilter").addEventListener("change", () => {
        currentPage = 1;
        renderCustomers();
    });

    // Xóa bộ lọc
    get("clearFilterBtn").addEventListener("click", () => {
        get("customerSearch").value = "";
        get("customerFilter").value = "all";

        currentPage = 1;
        renderCustomers();
    });

    // Làm mới danh sách
    get("refreshBtn").addEventListener("click", () => {
        renderCustomers();

        showNotice(
            "customerNotice",
            "Đã làm mới danh sách khách hàng."
        );
    });

    // Trang trước
    get("prevBtn").addEventListener("click", () => {
        if (currentPage > 1) currentPage--;
        renderCustomers();
    });

    get("nextBtn").addEventListener("click", () => {
        currentPage++;
        renderCustomers();
    });

    get("customerModal").addEventListener("click", event => {
        if (event.target === get("customerModal")) {
            closeModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeModal();
            closeReset();
        }
    });

    window.addEventListener("storage", event => {
        if (event.key === storageKey) {
            renderCustomers();
        }
    });

    // ================= KHỞI CHẠY =================

    renderCustomers();
});
