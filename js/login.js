/* Admin login */
const usernameAdmin = document.getElementById("adminUsername");
const passwordAdmin = document.getElementById("adminPassword");

const usernameError =document.getElementById("usernameError");
const passwordError =document.getElementById("passwordError");
document
    .getElementById("adminLoginForm")
    ?.addEventListener("submit", function(event) {

        event.preventDefault();

        if (usernameAdmin.value.trim() === "admin" && passwordAdmin.value === "123456") {

            localStorage.setItem(
                "adminLoggedIn",
                "true"
            );

            window.location.href = "dashboard.html";

            return;
        }

        if(usernameAdmin.value.trim() !== "admin") {
            usernameError.style.display = "block";
            usernameError.innerHTML = "Tên tài khoản sai"
        }
        else{
            usernameError.style.display = "none"
        }

        if(passwordAdmin.value !== "123456") {
            passwordError.style.display = "block";
            passwordError.innerHTML = "Mật khẩu sai"
        }
        else{
            passwordError.style.display = "none"
        }
    });

/* CUstomer login */

const usernameCustomer = document.getElementById("username")

    