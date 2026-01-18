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
    alert("All fields are required");
    return;
  }

  try {
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
  } catch (err) {
    alert("Server error");
  }
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

  try {
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

    // 🔥 SAVE USER CORRECTLY
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);

    console.log("USER SAVED:", localStorage.getItem("user"));

    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}
