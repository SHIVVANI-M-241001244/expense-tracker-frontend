/*******************************
  DARK MODE (SAFE)
********************************/
function setGreeting() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const hour = new Date().getHours();
  let greeting = "";
  let sub = "";
  let emoji = "";

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
    emoji = "☀️";
    sub = "Let’s make today financially calm & confident ✨";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
    emoji = "🌤️";
    sub = "Small steps today build strong habits 💛";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
    emoji = "🌆";
    sub = "You’re doing great — every rupee counts 💜";
  } else {
    greeting = "Good Night";
    emoji = "🌙";
    sub = "Track gently, rest peacefully 🤍";
  }

  document.getElementById(
    "greetingText"
  ).innerText = `${greeting}, ${user.name} ${emoji}`;

  document.getElementById("greetingSub").innerText = sub;
}

setGreeting();

if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "dark",
    document.body.classList.contains("dark")
  );
}

/*******************************
  AUTH CHECK
********************************/
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.id) {
  alert("Please login again");
  window.location.href = "login.html";
}

/*******************************
  GREETING
********************************/
const usernameEl = document.getElementById("username");
if (usernameEl) {
  const hour = new Date().getHours();
  let greet = "Hello";

  if (hour >= 5 && hour < 12) greet = "Good Morning";
  else if (hour >= 12 && hour < 17) greet = "Good Afternoon";
  else if (hour >= 17 && hour < 21) greet = "Good Evening";
  else greet = "Good Night";

  usernameEl.innerText = `${greet}, ${user.name}`;
}

/*******************************
  API
********************************/
const API =
  "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/*******************************
  ADD TRANSACTION
********************************/
async function addTransaction() {
  const typeEl = document.getElementById("type");
  const categoryEl = document.getElementById("category");
  const amountEl = document.getElementById("amount");
  const noteEl = document.getElementById("note");

  const type = typeEl.value;
  const category = categoryEl.value;
  const amount = amountEl.value;
  const note = noteEl.value;

  if (!amount) {
    alert("Amount is required");
    return;
  }

  if (type === "expense" && !category) {
    alert("Please select a category");
    return;
  }

  const payload = {
    userId: user.id,
    type,
    category: type === "income" ? "Income" : category,
    amount: Number(amount),
    note
  };

  try {
    const res = await fetch(`${API}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Save failed");

    // Clear inputs
    amountEl.value = "";
    noteEl.value = "";
    categoryEl.value = "";

    loadTransactions();
  } catch (err) {
    console.error(err);
    alert("Transaction not saved ❌");
  }
}

/*******************************
  LOAD TRANSACTIONS
********************************/
async function loadTransactions() {
  try {
    const res = await fetch(`${API}/${user.id}`);
    const data = await res.json();

    let income = 0;
    let expense = 0;

    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    data.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${t.category}</span>
        <span>₹${t.amount}</span>
        <button onclick="deleteTx('${t._id}')">🗑️</button>
      `;
      list.appendChild(li);
    });

    document.getElementById("totalIncome").innerText = `₹${income}`;
    document.getElementById("totalExpense").innerText = `₹${expense}`;
    document.getElementById("balance").innerText = `₹${income - expense}`;

    // Charts
    if (typeof renderCharts === "function") {
      renderCharts(data);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to load transactions");
  }
}

/*******************************
  DELETE TRANSACTION
********************************/
async function deleteTx(id) {
  if (!confirm("Delete this transaction?")) return;

  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/*******************************
  LOGOUT
********************************/
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/*******************************
  INIT
********************************/
loadTransactions();
