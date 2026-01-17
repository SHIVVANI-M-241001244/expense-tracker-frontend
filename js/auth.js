console.log("AUTH JS LOADED");

const API = "https://shivvani-m-expense-backend.onrender.com/api/auth";

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
    alert(data.message || "Registration failed");
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

  if (!res.ok) {
    alert(data.message || "Login failed");
    return;
  }

  // ✅ THIS IS THE MOST IMPORTANT PART
  localStorage.setItem(
    "user",
    JSON.stringify({
      _id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      token: data.token,
    })
  );

  window.location.href = "dashboard.html";
}
