/* Admin login */

document
    .getElementById("adminLoginForm")
    ?.addEventListener("submit", function(event) {

        event.preventDefault();

        const username =
            document.getElementById("adminUsername").value.trim();

        const password =
            document.getElementById("adminPassword").value;

        if (username === "admin" && password === "123456") {

            localStorage.setItem(
                "adminLoggedIn",
                "true"
            );

            window.location.href = "dashboard.html";

            return;
        }

        alert("Sai tài khoản hoặc mật khẩu");
    });