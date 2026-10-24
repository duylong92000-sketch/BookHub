// Lấy ra elements 
const form = document.getElementById("formRegister")
const fullName = document.getElementById("fullName")
const userName = document.getElementById("userName")
const email= document.getElementById("email")
const phone = document.getElementById("phone")
const password = document.getElementById("password")
const repassword = document.getElementById("repassword")
const address = document.getElementById("address")

// Lấy ra elements lỗi 
const nameError = document.getElementById("nameError")
const usernameError = document.getElementById("usernameError")
const emailError = document.getElementById("emailError")
const phoneError = document.getElementById("phoneError")
const passwordError = document.getElementById("passwordError")
const repasswordError = document.getElementById("repasswordError")
const addressError = document.getElementById("addressError")

//Lấy dữ liệu từ localstorage
const customersLocal = JSON.parse(localStorage.getItem("customers")) || [];


//Hàm tạo customerID
let soThuTu = customersLocal.length+1;

function taoID() {
    let ma = "KH" + String(soThuTu).padStart(8, "0");
    soThuTu++;
    return ma;
}

form.addEventListener("submit", function(e){
    e.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    //Ẩn/hiện thông báo lỗi
    if (!fullName.value.trim()){
        // Hiển thị lỗi
        nameError.style.display = "block";
        nameError.innerHTML = "Tên không được để trống"
    }
    else{
        //Ẩn lỗi
        nameError.style.display = "none"
    }


    if (!userName.value.trim()){
        usernameError.style.display = "block";
        usernameError.innerHTML = "Tên không được để trống"
    }
    else{
        usernameError.style.display = "none"
    }

    
    if (!email.value.trim()){
        emailError.style.display = "block";
        emailError.innerHTML = "Email không được để trống"
    }
    else{
        emailError.style.display = "none"
    }


    if (!phone.value.trim()){
        phoneError.style.display = "block";
        phoneError.innerHTML = "Số điện thoại không được để trống"
    }
    else{
        phoneError.style.display = "none"
    }


    if (!password.value.trim()){
        passwordError.style.display = "block";
        passwordError.innerHTML = "Mật khẩu không được để trống"
    }
    else{
        passwordError.style.display = "none"
    }
    

    if (!repassword.value.trim()){
        repasswordError.style.display = "block";
        repasswordError.innerHTML = "Mật khẩu không khớp"
    }
    else{
        repasswordError.style.display = "none"
    }



    //Gửi dữ liệu từ form lên localStorage
    if( fullName.value.trim() && 
        userName.value.trim() && 
        email.value.trim() && 
        phone.value.trim() && 
        password.value.trim() === repassword.value.trim())
    {
        
        
    
        //Lấy dữ liệu từ form và gộp thành đối tượng user
        const customers = {
            customerID: taoID(),
            fullName: fullName.value.trim(),
            userName: userName.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            password: password.value.trim(),
            address: address.value,

        };    
        
        //Push customer vào trong mảng customerLocal
        customersLocal.push(customers);
        
        //Lưu dữ liệu lên local
        localStorage.setItem("customers", JSON.stringify(customersLocal))
        
        //chuyển hướng về trang đăng nhập
        setTimeout(function(){
        window.location.href = "login.html"
        }, 500);
    }
    
});

fullName.addEventListener("input", function() {
    const value = fullName.value.trim();
    
    // Cắt chuỗi để đếm số lượng từ (bỏ qua khoảng trắng thừa ở giữa)
    const wordCount = value.split(/\s+/).filter(word => word !== "").length;

    if (fullName.value === "") {
        nameError.textContent = "Vui lòng nhập họ và tên";
    } 
    else if (fullName.value.length < 2) {
        nameError.textContent = "Họ và tên phải có ít nhất 2 ký tự";
    } 
    else if (wordCount < 2) {
        nameError.textContent = "Vui lòng nhập đầy đủ cả họ và tên (ít nhất 2 từ)";
    }
    else {
        nameError.textContent = "";
    }
});

userName.addEventListener("input", function () {
    if (userName.value.trim() === "") {
        usernameError.textContent = "Vui lòng nhập tên hiển thị";
    } 
    else if (userName.value.trim().length < 2 || userName.value.trim().length >30) {
        usernameError.textContent = "Tên hiển thị phải có ít nhất 2 ký tự và không quá 30 ký tự";
    } 
    else {
        usernameError.textContent = "";
    }
});

email.addEventListener("input", function () {
    if (email.value.trim() === "") {
        emailError.textContent = "Vui lòng nhập email";
    } 
    else if (email.validity.typeMismatch) {
        emailError.textContent = "Email không đúng định dạng";
    } 
    else {
        emailError.textContent = "";
    }
});

//Kiểm tra số điện thoại
phone.addEventListener("input", function () {
    if (!/^0[0-9]{9}$/.test(phone.value)) {
        phoneError.textContent = "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0";
    } else {
        phoneError.textContent = "";
    }
});

//Kiểm tra mật khẩu
password.addEventListener("input", function () {
    if(password.value.trim() === "") {
        passwordError.textContent = "Vui lòng nhập password";
    }
    else if (password.validity.tooShort) {
        passwordError.textContent = "Mật khẩu phải có ít nhất 8 ký tự";
    } 
    else {
        passwordError.textContent = "";
    }
});

//Kiểm tra lại mật khẩu
repassword.addEventListener("input", function() {
    if (password.value !== repassword.value){
        repasswordError.textContent = "Mật khẩu không khớp";
    }
    else {
        repasswordError.textContent = "";
    }  
});