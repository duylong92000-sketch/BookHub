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

    customersLoginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        //Validate dữ liệu đầu vào 
        if (!usernammeCustomers.value.trim()){
            userError.style.display = "block";
            userError.innerHTML = "Email không được để trống"
        }
        else{
            userError.style.display = "none"
        }

        if (!passwordCustomers.value.trim()){
            passwordError.style.display = "block";
            passwordError.innerHTML = "Mật khẩu không được để trống"
        }
        else{
            passwordError.style.display = "none"
        }

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
            else {
                localStorage.setItem("currentUser", JSON.stringify(findUser));
                window.location.href = "profile.html";
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
