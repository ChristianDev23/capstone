const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const username = document.getElementById("username");

togglePassword?.addEventListener("click", () => {
    password.type = password.type === "password" ? "text" : "password";
});

loginBtn.addEventListener("click", async () => {
    const user = username.value.trim();
    const pass = password.value.trim();
    if (!user || !pass) return alert("Enter username and password");

    try {
        const res = await fetch("http://localhost:5229/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return alert(err.error || "Login failed");
        }

        const data = await res.json();
        localStorage.setItem("role", data.role);
        window.location.href = "main.html";

    } catch (err) {
        console.error(err);
        alert("Error connecting to server");
    }
});