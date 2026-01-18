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
if (greetingText && greetingMsg) {
  const hour = new Date().getHours();

  let greet = "Good Evening";
  let msg = "Reflect on your spending and plan better 🌙";

  if (hour < 12) {
    greet = "Good Morning";
    msg = "Start your day with mindful spending ☀️";
  } else if (hour < 17) {
    greet = "Good Afternoon";
    msg = "Keep tracking — every rupee counts 💫";
  }

  greetingText.innerText = `${greet}, ${user.name}`;
  greetingMsg.innerText = msg;
}

/* =========================
   LOAD TRANSACTIONS
========================= */
async function loadTransactions() {
  console.log("INSIDE loadTransactions()");
  console.log("FETCHING URL 👉", `${API}/${user._id}`);
 
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
      li.innerHTML = `<span>${t.category} – ₹${t.amount}</span>`;
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
    alert("Enter a valid amount");
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

  const textColor = isDark ? "#f1f1f1" : "#2f2f2f";
  const gridColor = isDark ? "rgba(255,255,255,0.25)" : "#e5e7eb";

  const incomeColor = "#86EFAC";   // mint
  const expenseColor = "#FCA5A5";  // soft red
  const savingsColor = "#A5B4FC";  // lavender

  /* ================= PIE CHART ================= */
  const expenseMap = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      expenseMap[t.category] =
        (expenseMap[t.category] || 0) + t.amount;
    });

  if (Object.keys(expenseMap).length === 0) {
    document.getElementById("pieChart").parentElement.innerHTML =
      "<p style='text-align:center;color:var(--muted)'>No expense data</p>";
  } else {
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(document.getElementById("pieChart"), {
      type: "pie",
      data: {
        labels: Object.keys(expenseMap),
        datasets: [{
          data: Object.values(expenseMap),
            backgroundColor: [
            "#FFE5EC", // blush
            "#E0FBFC", // soft aqua
            "#EAE4FF", // lavender
            "#FFF1C1", // pastel yellow
            "#DCFCE7", // mint
            "#FDE2E4"  // rose
          ],
          Width: 2,
          borderColor: isDark ? "#2f2f46" : "#ffffff"
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
          }
        }
      }
    });
  }

  /* ================= BAR CHART ================= */
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [{
        label: "Amount (₹)",
        data: [income, expense, savings],
        backgroundColor: [incomeColor, expenseColor, savingsColor],
        borderRadius: 10
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

  /* ================= LINE CHART ================= */
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
        label: "Balance (₹)",
        data: trend,
        borderColor: savingsColor,
        backgroundColor: "rgba(165,180,252,0.35)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: savingsColor
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
console.log("BEFORE loadTransactions()");
loadTransactions();
console.log("AFTER loadTransactions()");

window.addTransaction = addTransaction;
window.toggleTheme = toggleTheme;
window.logout = logout;
/* =========================
   STATIC NIFTY DISPLAY
   (SAFE UI ONLY)
========================= */
(function showNifty() {
  const isDark = document.body.classList.contains("dark");

  const niftyValue = document.getElementById("niftyValue");
  const niftyChange = document.getElementById("niftyChange");

  if (!niftyValue || !niftyChange) return;

  // Static sample values (safe)
  const value = 22450.35;
  const change = +124.6;

  niftyValue.innerText = value.toLocaleString("en-IN");

  if (change >= 0) {
    niftyChange.innerText = `+${change} (+0.56%)`;
    niftyChange.className = "nifty-up";
  } else {
    niftyChange.innerText = `${change} (-0.56%)`;
    niftyChange.className = "nifty-down";
  }
})();