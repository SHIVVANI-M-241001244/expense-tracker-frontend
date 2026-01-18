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
    alert("Email and password required");
    return;
  }

  try {
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

    /* ✅ NORMALIZE USER (THIS FIXES EVERYTHING) */
    const user = {
      _id: data.user.id,   // 🔥 FIX IS HERE
      name: data.user.name,
      email: data.user.email,
    };

    localStorage.setItem("user", JSON.stringify(user));

    console.log("User saved:", user);

    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

/* =========================
   AUTO REDIRECT (OPTIONAL)
========================= */
(function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && window.location.pathname.includes("login")) {
    window.location.href = "dashboard.html";
  }
})();
