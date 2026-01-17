const API = "https://shivvani-m-expense-backend.onrender.com/api/auth";

console.log("AUTH JS LOADED");

/* =========================
   REGISTER
========================= */
async function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    alert("All fields required");
    return;
  }

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Register failed");
    return;
  }

  alert("Registered successfully ✅");
  window.location.href = "login.html";
}

/* =========================
   LOGIN
========================= */
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Email & password required");
    return;
  }

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  console.log("LOGIN RESPONSE:", data);

  if (!res.ok) {
    alert(data.message || "Login failed");
    return;
  }

  // 🔥 SAVE EXACT BACKEND RESPONSE
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  window.location.href = "dashboard.html";
}
