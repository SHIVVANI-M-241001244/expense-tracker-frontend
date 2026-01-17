if (!document.getElementById("transactionList")) return;

const API_URL =
  "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/* =========================
   USER NORMALIZATION
========================= */
const userRaw = JSON.parse(localStorage.getItem("user"));

if (!userRaw) {
  window.location.href = "login.html";
}

const user = {
  ...userRaw,
  id: userRaw._id || userRaw.id,
};

/* =========================
   GREETING
========================= */
function loadGreeting() {
  const hour = new Date().getHours();
  let greet = "Hello";

  if (hour < 12) greet = "Good Morning ☀️";
  else if (hour < 18) greet = "Good Afternoon 🌤️";
  else greet = "Good Evening 🌙";

  document.getElementById("greeting").innerText = greet;
  document.getElementById("username").innerText = user.name || "User";
}

loadGreeting();

/* =========================
   DARK MODE
========================= */
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

/* =========================
   CATEGORY TOGGLE
========================= */
document.getElementById("type").addEventListener("change", () => {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category");

  if (type === "expense") {
    category.style.display = "block";
  } else {
    category.style.display = "none";
    category.value = "";
  }
});

/* =========================
   BUDGET
========================= */
function saveBudget() {
  const budget = document.getElementById("budgetInput").value;
  if (!budget) return alert("Enter budget");
  localStorage.setItem("budget", budget);
}

function checkBudget(expense) {
  const budget = localStorage.getItem("budget");
  const status = document.getElementById("budgetStatus");
  if (!budget) return;

  status.innerText =
    expense > Number(budget)
      ? "⚠️ Budget exceeded!"
      : "✅ Within budget";
}

/* =========================
   ADD TRANSACTION
========================= */
async function addTransaction() {
  const btn = document.getElementById("addBtn");
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  if (!amount || (type === "expense" && !category)) {
    alert("Fill all required fields");
    return;
  }

  btn.innerText = "Adding...";
  btn.disabled = true;

  try {
    await fetch(`${API_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        type,
        category: type === "income" ? "Income" : category,
        amount: Number(amount),
        note,
      }),
    });

    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";

    loadTransactions();
    if (typeof loadCharts === "function") loadCharts();

    btn.innerText = "Added ✅";
    setTimeout(() => {
      btn.innerText = "Add";
      btn.disabled = false;
    }, 800);
  } catch (e) {
    alert("Not added ❌");
    btn.innerText = "Add";
    btn.disabled = false;
  }
}

/* =========================
   LOAD TRANSACTIONS
========================= */
async function loadTransactions() {
  const res = await fetch(`${API_URL}/${user.id}`);
  const transactions = await res.json();

  let income = 0;
  let expense = 0;
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.category}</span>
      <span class="${t.type}">
        ${t.type === "income" ? "+" : "-"}₹${t.amount}
      </span>
      <button onclick="deleteTransaction('${t._id}')">🗑️</button>
    `;
    list.appendChild(li);
  });

  document.getElementById("totalIncome").innerText = `₹${income}`;
  document.getElementById("totalExpense").innerText = `₹${expense}`;
  document.getElementById("balance").innerText = `₹${income - expense}`;

  checkBudget(expense);
}

/* =========================
   DELETE
========================= */
async function deleteTransaction(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* =========================
   INIT
========================= */
loadTransactions();
if (typeof loadCharts === "function") loadCharts();
