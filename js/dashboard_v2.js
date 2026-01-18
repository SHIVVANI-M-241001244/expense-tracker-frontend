alert("NEW DASHBOARD JS LOADED");
console.log("DASHBOARD_V2 FINAL WITH CHARTS");

/* ================= AUTH CHECK ================= */
const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user._id) {
  alert("Invalid user. Please login again.");
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

/* ================= LOAD TRANSACTIONS ================= */
async function loadTransactions() {
  try {
    const res = await fetch(`${API}/${user._id}`);
    const transactions = await res.json();

    let income = 0;
    let expense = 0;

    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    transactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

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

    renderCharts(transactions, income, expense);
  } catch (err) {
    console.error(err);
    alert("Failed to load transactions");
  }
}

/* ================= ADD TRANSACTION ================= */
async function addTransaction() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  if (!amount || isNaN(amount)) {
    alert("Enter a valid amount");
    return;
  }

  await fetch(`${API}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user._id,
      type,
      category: type === "income" ? "Income" : category,
      amount: Number(amount),
      note
    })
  });

  document.getElementById("amount").value = "";
  document.getElementById("note").value = "";
  document.getElementById("category").value = "";

  loadTransactions();
}

/* ================= DELETE ================= */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    alert("Delete failed");
    return;
  }
  loadTransactions();
}

/* ================= EDIT ================= */
async function editTransaction(id, oldAmount) {
  const amount = prompt("Enter new amount:", oldAmount);
  if (!amount || isNaN(amount)) return;

  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Number(amount) })
  });

  if (!res.ok) {
    alert("Update failed");
    return;
  }
  loadTransactions();
}

/* ================= CHARTS ================= */
function renderCharts(transactions, income, expense) {
  const savings = income - expense;
  const isDark = document.body.classList.contains("dark");

  const textColor = isDark ? "#f8fafc" : "#2f2f2f";
  const gridColor = isDark ? "rgba(255,255,255,0.2)" : "#e5e7eb";

  /* ===== PIE CHART ===== */
  const expenseMap = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
    });

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{
        data: Object.values(expenseMap),
        backgroundColor: [
          "#FFE5EC",
          "#E0FBFC",
          "#EAE4FF",
          "#FFF1C1",
          "#DCFCE7",
          "#FDE2E4"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor } }
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
        data: [income, expense, savings],
        backgroundColor: ["#22c55e", "#ef4444", "#6366f1"],
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
      plugins: { legend: { display: false } }
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
        data: trend,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.3)",
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

/* ================= THEME ================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
  loadTransactions();
}

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
