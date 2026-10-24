// Lấy ra elements 
const form = document.getElementById("formRegister")
const fullName = document.getElementById("fullName")
const userName = document.getElementById("username")
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
const customerLocal = JSON.parse(localStorage.getItem("customers")) || [];


//Hàm tạo customerID
let soThuTu = customerLocal.length+1;

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
    if (!fullName.value){
        // Hiển thị lỗi
        nameError.style.display = "block";
        nameError.innerHTML = "Tên không được để trống"
    }
    else{
        //Ẩn lỗi
        nameError.style.display = "none"
    }


    if (!userName.value){
        usernameError.style.display = "block";
        usernameError.innerHTML = "Tên không được để trống"
    }
    else{
        usernameError.style.display = "none"
    }

    
    if (!email.value){
        emailError.style.display = "block";
        emailError.innerHTML = "Email không được để trống"
    }
    else{
        emailError.style.display = "none"
    }


    if (!phone.value){
        phoneError.style.display = "block";
        phoneError.innerHTML = "Số điện thoại không được để trống"
    }
    else{
        phoneError.style.display = "none"
    }


    if (!password.value){
        passwordError.style.display = "block";
        passwordError.innerHTML = "Mật khẩu không được để trống"
    }
    // else if (password.value.length < 8) {
    //     passwordError.style.display = "block";
    //     passwordError.innerHTML = "Mật khẩu phải có ít nhất 8 kí tự";
    // }
    else{
        passwordError.style.display = "none"
    }
    

    if (!repassword.value){
        repasswordError.style.display = "block";
        repasswordError.innerHTML = "Nhập lại mật khẩu"
    }
    else{
        repasswordError.style.display = "none"
    }

    //Kiểm tra định dạng Họ và tên
    if(fullName.value == Number)
    {

    }
    //Kiểm tra lại mật khẩu
    if (password.value !== repassword.value){
        repasswordError.style.display="block";
        repasswordError.innerHTML = "Mật khẩu không khớp";
    }
 
    //kiểm tra sđt

    //Gửi dữ liệu từ form lên localStorage
    if( fullName.value.trim() && 
        userName.value.trim() && 
        email.value.trim() && 
        phone.value.trim() && 
        password.value.trim() === repassword.value.trim())
    {
        console.log("Submits");
        
        
    
        //Lấy dữ liệu từ form và gộp thành đối tượng user
        const customers = {
            customerID: taoID(),
            fullName: fullName.value,
            userName: userName.value,
            email: email.value,
            phone: phone.value,
            password: password.value,
            address: address.value,

        };    
        
        //Push customer vào trong mảng customerLocal
        customerLocal.push(customers);
        
        //Lưu dữ liệu lên local
        localStorage.setItem("customers", JSON.stringify(customerLocal))
        
        //chuyển hướng về trang đăng nhập
        setTimeout(function(){
        window.location.href = "login.html"
        }, 500);
    }
    
});

email.addEventListener("input", function () {
    if (email.validity.valueMissing) {
        emailError.textContent = "Vui lòng nhập email";
    } 
    else if (email.validity.typeMismatch) {
        emailError.textContent = "Email không đúng định dạng";
    } 
    else {
        emailError.textContent = "";
    }
});


phone.addEventListener("input", function () {
    if (!/^0[0-9]{9}$/.test(phone.value)) {
        phoneError.textContent = "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0";
    } else {
        phoneError.textContent = "";
    }
});

password.addEventListener("input", function () {
    if(password.validity.valueMissing) {
        passwordError.textContent = "Vui lòng nhập password";
    }
    else if (password.validity.tooShort) {
        passwordError.textContent = "Mật khẩu phải có ít nhất 8 ký tự";
    } 
    else {
        passwordError.textContent = "";
    }
});