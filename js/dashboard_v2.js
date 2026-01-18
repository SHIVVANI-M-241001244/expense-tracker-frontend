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
   GREETING
========================= */
const greetingText = document.getElementById("greetingText");
const greetingMsg = document.getElementById("greetingMsg");

if (greetingText && greetingMsg) {
  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "Good Morning" :
    hour < 17 ? "Good Afternoon" :
    "Good Evening";

  greetingText.innerText = `${greet}, ${user.name} 💜`;
  greetingMsg.innerText = "Track your expenses, grow your savings, and stay in control ✨";
}

/* =========================
   CHART VARIABLES
========================= */
let pieChart = null;
let barChart = null;
let lineChart = null;

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
        <span>${t.category} - ₹${t.amount}</span>
        <div>
          <button onclick="editTransaction('${t._id}', '${t.category}', ${t.amount}, '${t.type}')">✏️</button>
          <button onclick="deleteTransaction('${t._id}')">🗑️</button>
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

/* =========================
   ADD TRANSACTION
========================= */
async function addTransaction() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  if (!amount || (type === "expense" && !category)) {
    alert("Fill all required fields");
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
    }),
  });

  document.getElementById("amount").value = "";
  document.getElementById("note").value = "";
  document.getElementById("category").value = "";

  loadTransactions();
}

/* =========================
   EDIT TRANSACTION ✅
========================= */
async function editTransaction(id, oldCategory, oldAmount, type) {
  const newAmount = prompt("Edit amount:", oldAmount);
  if (!newAmount) return;

  const newCategory =
    type === "income"
      ? "Income"
      : prompt("Edit category:", oldCategory);

  if (type === "expense" && !newCategory) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: newCategory,
      amount: Number(newAmount),
      type
    }),
  });

  loadTransactions();
}

/* =========================
   DELETE TRANSACTION ✅
========================= */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  await fetch(`${API}/${id}`, {
    method: "DELETE"
  });

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
   DARK MODE TOGGLE
========================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* =========================
   CHARTS (FIXED & VISIBLE)
========================= */
function renderCharts(transactions, income, expense) {
  const savings = income - expense;

  /* -------- PIE (EXPENSE ONLY) -------- */
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
          "#fbbf24",
          "#fca5a5",
          "#86efac",
          "#93c5fd",
          "#c4b5fd"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: document.body.classList.contains("dark") ? "#eee" : "#333"
          }
        }
      }
    }
  });

  /* -------- BAR -------- */
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [{
        data: [income, expense, savings],
        backgroundColor: ["#86efac", "#fca5a5", "#93c5fd"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: document.body.classList.contains("dark") ? "#eee" : "#333" }
        },
        y: {
          ticks: { color: document.body.classList.contains("dark") ? "#eee" : "#333" }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  /* -------- LINE (TREND) -------- */
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
        borderColor: "#a78bfa",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: document.body.classList.contains("dark") ? "#eee" : "#333" }
        },
        y: {
          ticks: { color: document.body.classList.contains("dark") ? "#eee" : "#333" }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: document.body.classList.contains("dark") ? "#eee" : "#333"
          }
        }
      }
    }
  });
}

/* =========================
   INIT
========================= */
loadTransactions();
