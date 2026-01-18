console.log("DASHBOARD JS LOADED");

/* ================= AUTH ================= */
const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user._id) {
  alert("Please login again");
  window.location.href = "login.html";
}

/* ================= API ================= */
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/* ================= GLOBAL CHARTS ================= */
let pieChart = null;
let barChart = null;
let lineChart = null;

/* ================= GREETING ================= */
const greetingText = document.getElementById("greetingText");
const greetingMsg = document.getElementById("greetingMsg");

const hour = new Date().getHours();
if (hour < 12) {
  greetingText.innerText = `Good Morning, ${user.name}`;
  greetingMsg.innerText = "Start your day with mindful spending ☀️";
} else if (hour < 17) {
  greetingText.innerText = `Good Afternoon, ${user.name}`;
  greetingMsg.innerText = "Every rupee counts 💫";
} else {
  greetingText.innerText = `Good Evening, ${user.name}`;
  greetingMsg.innerText = "Reflect and plan better 🌙";
}

/* ================= LOAD TRANSACTIONS ================= */
async function loadTransactions() {
  const res = await fetch(`${API}/${user._id}`);
  const data = await res.json();

  let income = 0;
  let expense = 0;

  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  data.forEach(t => {
    t.type === "income" ? income += t.amount : expense += t.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.category} – ₹${t.amount}</span>
      <div class="tx-actions">
        <button class="edit-btn" onclick="editTransaction('${t._id}', ${t.amount})">✏️</button>
        <button class="delete-btn" onclick="deleteTransaction('${t._id}')">🗑</button>
      </div>
    `;
    list.appendChild(li);
  });

  document.getElementById("totalIncome").innerText = `₹${income}`;
  document.getElementById("totalExpense").innerText = `₹${expense}`;
  document.getElementById("balance").innerText = `₹${income - expense}`;

  renderCharts(data, income, expense);
  updateBudgetStatus();
}

/* ================= ADD ================= */
async function addTransaction() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;

  if (!amount || isNaN(amount)) {
    alert("Enter valid amount");
    return;
  }

  await fetch(`${API}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user._id,
      type,
      category: type === "income" ? "Income" : category,
      amount: Number(amount)
    })
  });

  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";

  loadTransactions();
}

/* ================= EDIT ================= */
async function editTransaction(id, oldAmount) {
  const val = prompt("Enter new amount", oldAmount);
  if (!val || isNaN(val)) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Number(val) })
  });

  loadTransactions();
}

/* ================= DELETE ================= */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/* ================= CHARTS ================= */
function renderCharts(data, income, expense) {
  const savings = income - expense;

  pieChart?.destroy();
  barChart?.destroy();
  lineChart?.destroy();

  /* ===== PIE ===== */
  const expenseMap = {};
  data.filter(t => t.type === "expense")
      .forEach(t => expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount);

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{
        data: Object.values(expenseMap),
        backgroundColor: [
          "#FFE5EC", "#E0FBFC", "#EAE4FF",
          "#FFF1C1", "#DCFCE7", "#FDE2E4"
        ]
      }]
    },
    options: { responsive: true }
  });

  /* ===== BAR ===== */
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [{
        data: [income, expense, savings],
        backgroundColor: ["#22c55e", "#ef4444", "#6366f1"],
        borderRadius: 10
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  /* ===== LINE ===== */
  let running = 0;
  const trend = [];
  data.forEach(t => {
    running += t.type === "income" ? t.amount : -t.amount;
    trend.push(running);
  });

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: trend.map((_, i) => `T${i + 1}`),
      datasets: [{
        data: trend,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.3)",
        fill: true
      }]
    }
  });
}

/* ================= BUDGET ================= */
function saveBudget() {
  localStorage.setItem("budget", budgetInput.value);
  updateBudgetStatus();
}

function updateBudgetStatus() {
  const budget = Number(localStorage.getItem("budget"));
  if (!budget) return;

  const expense = Number(totalExpense.innerText.replace("₹", ""));
  const remaining = budget - expense;

  const el = document.getElementById("budgetStatus");
  if (remaining < 0) {
    el.innerText = `⚠️ Budget exceeded by ₹${Math.abs(remaining)}`;
    el.className = "budget-status over";
  } else {
    el.innerText = `✅ ₹${remaining} left from your budget`;
    el.className = "budget-status safe";
  }
}

/* ================= THEME ================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* ================= NIFTY ================= */
document.getElementById("niftyValue").innerText = "22,450.35";
document.getElementById("niftyChange").innerText = "+124.60 (+0.56%)";

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ================= INIT ================= */
loadTransactions();

window.addTransaction = addTransaction;
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.saveBudget = saveBudget;
