console.log("DASHBOARD V2 LOADED");

/* ================= AUTH ================= */
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("Login again");
  location.href = "login.html";
}

/* ================= API ================= */
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/* ================= GLOBAL CHARTS ================= */
let pieChart = null;
let barChart = null;
let lineChart = null;

/* ================= GREETING ================= */
const hour = new Date().getHours();
document.getElementById("greetingText").innerText =
  hour < 12
    ? `Good Morning, ${user.name}`
    : hour < 17
    ? `Good Afternoon, ${user.name}`
    : `Good Evening, ${user.name}`;

/* ================= LOAD TRANSACTIONS ================= */
async function loadTransactions() {
  const res = await fetch(`${API}/${user._id}`);
  const data = await res.json();

  const totalIncome = document.getElementById("totalIncome");
  const totalExpense = document.getElementById("totalExpense");
  const balance = document.getElementById("balance");

  let income = 0;
  let expense = 0;

  data.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  /* SUMMARY */
  totalIncome.innerText = `₹${income}`;
  totalExpense.innerText = `₹${expense}`;
  balance.innerText = `₹${income - expense}`;

  /* ===== LAST TRANSACTION ONLY ===== */
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  const sortedData = [...data].sort((a, b) =>
    new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );

  if (sortedData.length > 0) {
    const t = sortedData[sortedData.length - 1];

    const li = document.createElement("li");
    li.classList.add(t.type);
    li.innerHTML = `
      <span>
        ${t.type === "income" ? "💰 Income" : "💸 Expense"} —
        ${t.category} — ₹${t.amount}
      </span>
    `;
    list.appendChild(li);
  }

  /* BUDGET MESSAGE */
  updateBudgetStatus(expense);

  /* CHARTS */
  renderCharts(data, income, expense);
}

/* ================= ADD ================= */
async function addTransaction() {
  await fetch(`${API}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user._id,
      type: type.value,
      category: category.value,
      amount: Number(amount.value)
    })
  });

  amount.value = "";
  loadTransactions();
}

/* ================= CHARTS ================= */
function renderCharts(data, income, expense) {
  const savings = income - expense;

  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
  if (lineChart) lineChart.destroy();

  const isDark = document.body.classList.contains("dark");
  const textColor = isDark ? "#f8fafc" : "#020617";
  const gridColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

  /* ===== PIE ===== */
  const expenseMap = {};
  data.filter(t => t.type === "expense").forEach(t => {
    expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
  });

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{
        data: Object.values(expenseMap),
        backgroundColor: [
          "#fda4af",
          "#93c5fd",
          "#c4b5fd",
          "#86efac",
          "#fde68a"
        ],
        borderWidth: 2,
        borderColor: isDark ? "#020617" : "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: textColor,
            font: { size: 14, weight: "600" }
          }
        }
      }
    }
  });

  /* ===== BAR ===== */
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [{
        data: [income, expense, savings],
        backgroundColor: ["#86efac", "#fca5a5", "#a5b4fc"],
        borderRadius: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      },
      plugins: { legend: { display: false } }
    }
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
        backgroundColor: "rgba(99,102,241,0.25)",
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

/* ================= BUDGET MESSAGE ================= */
function updateBudgetStatus(expense) {
  const budget = Number(localStorage.getItem("budget"));
  const statusEl = document.getElementById("budgetStatus");
  if (!budget || !statusEl) return;

  const remaining = budget - expense;

  if (remaining < 0) {
    statusEl.innerText =
      `⚠️ You exceeded your budget by ₹${Math.abs(remaining)}. Time to slow down.`;
    statusEl.className = "budget-status over";
  } else {
    statusEl.innerText =
      `✅ You still have ₹${remaining} left. Spend mindfully 🌱`;
    statusEl.className = "budget-status safe";
  }
}

/* ================= THEME ================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
  loadTransactions();
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  location.href = "login.html";
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", loadTransactions);
