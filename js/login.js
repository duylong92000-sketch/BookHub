// Đọc danh sách khách hàng an toàn (dữ liệu hỏng thì trả về mảng rỗng)
function getCustomersSafe() {
    try {
        const list = JSON.parse(localStorage.getItem("customers"));
        return Array.isArray(list) ? list : [];
    } catch (error) {
        console.error("Lỗi đọc danh sách khách hàng:", error);
        return [];
    }
}


/* Admin login */
const adminLoginForm = document.getElementById("adminLoginForm")

if(adminLoginForm) {
    const usernameAdmin = document.getElementById("adminUsername")
    const passwordAdmin = document.getElementById("adminPassword")
    const userError = document.getElementById("userError")
    const passwordError =document.getElementById("passwordError")   

    adminLoginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        let isValid = true;

        if (!usernameAdmin.value.trim()){
            userError.style.display = "block";
            userError.innerHTML = "Tên không được để trống"
            isValid = false;
        }
        else{
            userError.style.display = "none"
        }

        if (passwordAdmin.value.trim() === ""){
            passwordError.style.display = "block";
            passwordError.innerHTML = "Mật khẩu không được để trống"
            isValid = false;
        }
        else{
            passwordError.style.display = "none"
        }        

        //Đối chiếu tên và mật khẩu admin
        if(isValid) {
            if (usernameAdmin.value.trim() === "admin" && passwordAdmin.value === "12345678") {

                localStorage.setItem("adminLoggedIn", "true");
                window.location.href = "dashboard.html";
            }
            else{
                passwordError.style.display = "block";
                passwordError.innerHTML = "Tài khoản hoặc mật khẩu không đúng "
            }
        }
    });

    passwordAdmin.addEventListener("input", function () {
        if(passwordAdmin.value.trim() === "") {
            passwordError.textContent = "Vui lòng nhập password";
        }
        else if (passwordAdmin.validity.tooShort) {
            passwordError.textContent = "Mật khẩu phải có ít nhất 8 ký tự";
        } 
        else {
            passwordError.textContent = "";
        }
    });
    
}

/* CUstomer login */
const customersLoginForm = document.getElementById("customersLoginForm")

if(customersLoginForm) {
    const usernammeCustomers = document.getElementById("userName")
    const passwordCustomers = document.getElementById("password")
    const userError = document.getElementById("userError")
    const passwordError =document.getElementById("passwordError")  

    /* Kiểm tra địa chỉ quay lại: cùng website và không phải trang đăng nhập/đăng ký */
    function isSafeReturnUrl(url) {
        if (!url) return false;
    
        try {
            const target = new URL(url, window.location.href);
    
            if (target.origin !== window.location.origin) return false;
    
            const blockedPages = ["login.html", "register.html"];
            const page = target.pathname.split("/").pop().toLowerCase();
    
            return !blockedPages.includes(page);
        } catch (error) {
            return false;
        }
    }

    /* Gộp giỏ hàng khi đăng nhập:giỏ đã lưu của tài khoản + sản phẩm khách đã thêm trước khi đăng nhập */
    function mergeCartOnLogin(user) {
        if (!user || !user.customerId) return;
    
        function read(key, defaultValue) {
            try {
                const value = JSON.parse(localStorage.getItem(key));
                return value === null || value === undefined ? defaultValue : value;
            } catch (error) {
                return defaultValue;
            }
        }
    
        // Đưa giỏ hàng (dạng object hoặc mảng cũ) về dạng { productId: số lượng }
        function toObject(cart) {
            const result = {};
    
            if (Array.isArray(cart)) {
                cart.forEach(item => {
                    if (item && typeof item.productId === "string") {
                        result[item.productId] = item.quantity;
                    }
                });
            } else if (cart && typeof cart === "object") {
                Object.assign(result, cart);
            }
    
            return result;
        }
    
        const guestCart = toObject(read("cart", {}));
        const allCarts = read("userCarts", {});
        const savedCart = toObject(allCarts[user.customerId]);
        const products = read("products", []);
    
        // Cộng dồn số lượng của hai giỏ
        const merged = {};
        [savedCart, guestCart].forEach(cart => {
            Object.entries(cart).forEach(([id, quantity]) => {
                const qty = Number(quantity);
                if (Number.isSafeInteger(qty) && qty > 0) {
                    merged[id] = (merged[id] || 0) + qty;
                }
            });
        });
    
        // Không vượt quá tồn kho
        Object.keys(merged).forEach(id => {
            const product = Array.isArray(products)
                ? products.find(p => p.productId === id)
                : null;
            const stock = product ? Number(product.stockQuantity || 0) : 0;
    
            if (stock > 0 && merged[id] > stock) merged[id] = stock;
        });
    
        localStorage.setItem("cart", JSON.stringify(merged));
    
        allCarts[user.customerId] = merged;
        localStorage.setItem("userCarts", JSON.stringify(allCarts));
    }

    customersLoginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        let isValid = true;


        //Validate dữ liệu đầu vào 
        if (!usernammeCustomers.value.trim()){
            userError.style.display = "block";
            userError.innerHTML = "Tên không được để trống"
            isValid = false;
        }
        else{
            userError.style.display = "none"
        }

        if (!passwordCustomers.value.trim()){
            passwordError.style.display = "block";
            passwordError.innerHTML = "Mật khẩu không được để trống"
            isValid = false;
        }
        else{
            passwordError.style.display = "none"
        }

        if (!isValid) return;

        //Lấy dữ liệu từ local về
        const customersLocal = JSON.parse(localStorage.getItem("customers")) || [];

        // Đối chiếu dữ liệu trên localStorage
        const findUser = customersLocal.find(
            (customers) => 
                customers.userName === usernammeCustomers.value.trim() && 
                customers.password === passwordCustomers.value.trim()
        );
            if (!findUser) {
                passwordError.style.display = "block";
                passwordError.innerHTML = "Tên hoặc mật khẩu không đúng"
            }
            else if (findUser.status === "inactive") {
                passwordError.style.display = "block";
                passwordError.innerHTML =
                    "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.";
            }
            else {
                // Lấy khóa giỏ hàng riêng của tài khoản
                const cartKey = "cart_" + findUser.customerId;

                // Chỉ chuyển dữ liệu cũ nếu chưa có giỏ hàng riêng
                if (localStorage.getItem(cartKey) === null) {
                    try {
                        const allCarts = JSON.parse( localStorage.getItem("userCarts") || "{}");

                        const oldCart = allCarts[findUser.customerId];

                        if (oldCart && typeof oldCart === "object") {
                            localStorage.setItem( cartKey,JSON.stringify(oldCart));
                        }
                    } catch (error) {
                        console.error("Lỗi chuyển dữ liệu giỏ cũ:", error);
                        }
                }

                // Đăng nhập thành công
                localStorage.setItem("currentUser",JSON.stringify(findUser));

                // Không xóa hoặc tạo lại giỏ nếu giỏ đã tồn tại

                const returnUrl = sessionStorage.getItem("returnUrl");
                sessionStorage.removeItem("returnUrl");

                window.location.href = isSafeReturnUrl(returnUrl)? returnUrl: "../index.html";
            }

    });

    usernammeCustomers.addEventListener("input", function () {
        if (usernammeCustomers.value.trim() === "") {
            userError.textContent = "Vui lòng nhập tên hiển thị";
        } 
        else if (usernammeCustomers.value.trim().length < 2 || usernammeCustomers.value.trim().length >30) {
            userError.textContent = "Tên hiển thị phải có ít nhất 2 ký tự và không quá 30 ký tự";
        } 
        else {
            userError.textContent = "";
        }
    });

    passwordCustomers.addEventListener("input", function () {
        if(passwordCustomers.value.trim() === "") {
            passwordError.textContent = "Vui lòng nhập password";
        }
        else if (passwordCustomers.validity.tooShort) {
            passwordError.textContent = "Mật khẩu phải có ít nhất 8 ký tự";
        } 
        else {
            passwordError.textContent = "";
        }
    });
    
}
