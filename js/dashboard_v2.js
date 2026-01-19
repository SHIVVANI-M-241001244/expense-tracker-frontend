console.log("DASHBOARD V2 LOADED");

/* AUTH */
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("Login again");
  location.href = "login.html";
}

/* API */
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

let pieChart, barChart, lineChart;

/* GREETING */
const hour = new Date().getHours();
document.getElementById("greetingText").innerText =
  hour < 12 ? `Good Morning, ${user.name}` :
  hour < 17 ? `Good Afternoon, ${user.name}` :
  `Good Evening, ${user.name}`;

/* LOAD TRANSACTIONS */
async function loadTransactions() {
  const res = await fetch(`${API}/${user._id}`);
  const data = await res.json();

  let income = 0, expense = 0;
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  data.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  /* SHOW LAST TRANSACTION ONLY */
  if (data.length > 0) {
    const t = data[data.length - 1];
    const li = document.createElement("li");
    li.innerHTML = `
      <span>
        ${t.type === "income" ? "💰 Income" : "💸 Expense"} —
        ${t.category} — ₹${t.amount}
      </span>
    `;
    list.appendChild(li);
  }

  document.getElementById("totalIncome").innerText = `₹${income}`;
  document.getElementById("totalExpense").innerText = `₹${expense}`;
  document.getElementById("balance").innerText = `₹${income - expense}`;

  renderCharts(data, income, expense);
  updateBudgetStatus(expense);
}

/* ADD */
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

/* CHARTS */
function renderCharts(data, income, expense) {
  const savings = income - expense;

  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
  if (lineChart) lineChart.destroy();

  const expenseMap = {};
  data.filter(t => t.type === "expense").forEach(t => {
    expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
  });

  const isDark = document.body.classList.contains("dark");
  const textColor = isDark ? "#f9fafb" : "#1f2937";
  const gridColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";

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
      borderColor: "#020617"
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false, // allows bigger pie
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#f8fafc",        // 🔥 BRIGHT WHITE TEXT
          font: {
            size: 15,
            weight: "bold"
          },
          padding: 18
        }
      },
      tooltip: {
        backgroundColor: "#020617",
        titleColor: "#f8fafc",     // 🔥
        bodyColor: "#f8fafc",      // 🔥
        borderWidth: 1,
        borderColor: "#475569"
      }
    }
  }
});


  /* BAR */
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [{
        data: [income, expense, savings],
        backgroundColor: ["#86efac", "#fca5a5", "#a5b4fc"],
        borderRadius: 10
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

  /* LINE */
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

/* BUDGET */
function updateBudgetStatus(expense) {
  const budget = Number(localStorage.getItem("budget"));
  if (!budget) return;

  const left = budget - expense;
  document.getElementById("budgetStatus").innerText =
    left < 0 ? `⚠ Exceeded by ₹${Math.abs(left)}` : `₹${left} left`;
}

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* LOGOUT */
function logout() {
  localStorage.clear();
  location.href = "login.html";
}
document.addEventListener("DOMContentLoaded", () => {
  loadTransactions();
});
