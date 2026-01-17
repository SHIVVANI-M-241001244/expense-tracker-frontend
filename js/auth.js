const API = "https://shivvani-m-expense-backend.onrender.com/api/auth";

/* =========================
   REGISTER
========================= */
async function register(event) {
  event.preventDefault();

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

    alert("Registration successful ✅");
    window.location.href = "login.html";
  } catch (err) {
    alert("Server error");
  }
}

/* =========================
   LOGIN
========================= */
async function login(event) {
  event.preventDefault();

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

    /* 🔥 IMPORTANT PART */
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
      })
    );

    window.location.href = "dashboard.html";
  } catch (err) {
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
