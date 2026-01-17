const API_URL =
  "https://shivvani-m-expense-backend.onrender.com/api/auth";

/* =======================
   REGISTER
======================= */
async function register() {
  const name = document.getElementById("name")?.value;
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("Registered successfully 🎉");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Register error:", error);
    alert("Server not reachable. Please try again later.");
  }
}

/* =======================
   LOGIN
======================= */
async function login() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Save token & user safely
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    alert("Server not reachable. Please try again later.");
  }
}
