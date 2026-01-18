console.log("DASHBOARD JS LOADED");

/* =========================
   AUTH CHECK
========================= */
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user._id) {
  alert("Invalid user. Please login again.");
  window.location.href = "login.html";
}

/* =========================
   API
========================= */
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/* =========================
   GLOBAL CHARTS
========================= */
let pieChart = null;
let barChart = null;
let lineChart = null;

/* =========================
   GREETING
========================= */
const greetingText = document.getElementById("greetingText");
const greetingMsg = document.getElementById("greetingMsg");

if (greetingText) {
  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "Good Morning" :
    hour < 17 ? "Good Afternoon" :
    "Good Evening";

  greetingText.innerText = `${greet}, ${user.name} 💜`;
  greetingMsg.innerText =
    "Track your money mindfully and watch your savings grow ✨";
}

/* =========================
   LOAD TRANSACTIONS
========================= */
async function loadTransactions() {
  try {
    const res = await fetch(`${API}/${user._id}`);
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
        <span>${t.category} – ₹${t.amount}</span>
      `;
      list.appendChild(li);
    });

    document.getElementById("totalIncome").innerText = `₹${income}`;
    document.getElementById("totalExpense").innerText = `₹${expense}`;
    document.getElementById("balance").innerText = `₹${income - expense}`;

    renderCharts(transactions, income, expense);
  } catch (err) {
    console.error(err);
    alert("Failed to load transactions");
  }
}

/* =========================
   ADD TRANSACTION
========================= */
async function addTransaction() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  if (!amount || isNaN(amount)) {
    alert("Enter valid amount");
    return;
  }

  try {
    await fetch(`${API}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        type,
        category: type === "income" ? "Income" : category,
        amount: Number(amount),
        note,
      }),
    });

    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";
    document.getElementById("category").value = "";

    loadTransactions();
  } catch (err) {
    console.error(err);
    alert("Add failed");
  }
}

/* =========================
   CHARTS
========================= */
function renderCharts(transactions, income, expense) {
  const savings = income - expense;
  const isDark = document.body.classList.contains("dark");

  const textColor = isDark ? "#ffffff" : "#333";
  const gridColor = isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb";

  /* ===== PIE CHART ===== */
  const expenseMap = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      expenseMap[t.category] =
        (expenseMap[t.category] || 0) + t.amount;
    });

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{
        data: Object.values(expenseMap),
        backgroundColor: [
          "#A5B4FC", // lavender
          "#FCA5A5", // soft red
          "#86EFAC", // mint
          "#FDE68A", // pastel yellow
          "#93C5FD", // sky blue
          "#FBCFE8"  // pink
        ],
        borderWidth: 2,
        borderColor: isDark ? "#1e1e2e" : "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: { size: 13 }
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ₹${ctx.raw}`
          }
        }
      }
    }
  });

  /* ===== BAR CHART ===== */
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [{
        label: "₹ Amount",
        data: [income, expense, savings],
        backgroundColor: ["#86EFAC", "#FCA5A5", "#A5B4FC"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      },
      plugins: {
        legend: { labels: { color: textColor } }
      }
    }
  });

  /* ===== LINE CHART ===== */
  let running = 0;
  const trend = [];

  transactions.forEach(t => {
    running += t.type === "income" ? t.amount : -t.amount;
    trend.push(running);
  });

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: trend.map((_, i) => `T${i + 1}`),
      datasets: [{
        label: "Balance",
        data: trend,
        borderColor: "#BFA7F3",
        backgroundColor: "rgba(191,167,243,0.2)",
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      },
      plugins: {
        legend: { labels: { color: textColor } }
      }
    }
  });
}

/* =========================
   THEME
========================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
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

window.addTransaction = addTransaction;
window.toggleTheme = toggleTheme;
window.logout = logout;
