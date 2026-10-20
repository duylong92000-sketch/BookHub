const form = document.getElementById("formRegister")
const fullName = document.getElementById("fullName")
const userNameID = document.getElementById("usernameID")
const email= document.getElementById("email")
const phone = document.getElementById("phone")
const password = document.getElementById("password")
const repassword = document.getElementById("repassword")
const address = document.getElementById("address")

const nameError = document.getElementById("nameError")
const usernameError = document.getElementById("usernameError")
const emailError = document.getElementById("emailError")
const phoneError = document.getElementById("phoneError")
const passwordError = document.getElementById("passwordError")
const repasswordError = document.getElementById("repasswordError")
const addressError = document.getElementById("addressError")

form.addEventListener("submit", function(e){
    e.preventDefault();

    if (!nameError.value){
        // Hiển thị lỗi
        nameError.style.display="block";
    }
    else{
        //Ẩn lỗi
        nameError.style.display="none"
    }


    if (!userNameID.value){
        usernameError.style.display="block";
    }
    else{
        usernameError.style.display="none"
    }

    
    if (!email.value){
        emailError.style.display="block";
    }
    else{
        emailError.style.display="none"
    }


    if (!phone.value){
        phoneError.style.display="block";
    }
    else{
        phoneError.style.display="none"
    }


    if (!password.value){
        passwordError.style.display="block";
    }
    else{
        passwordError.style.display="none"
    }
    

    if (!repassword.value){
        repasswordError.style.display="block";
    }
    else{
        repasswordError.style.display="none"
    }
    

    if (!address.value){
        addressError.style.display="block";
    }
    else{
        addressError.style.display="none"
    }

    //Kiểm tra lại mật khẩu
    if (password.value !== repassword.value){
        repasswordError.style.display="block";
        repasswordError.innerHTML = "mật khẩu không khớp";
    }
})