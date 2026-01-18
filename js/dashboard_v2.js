console.log("DASHBOARD JS LOADED");

const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user._id) {
  alert("Invalid user. Please login again.");
  window.location.href = "login.html";
}

const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

let pieChart, barChart, lineChart;

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
  greetingMsg.innerText = "Track your expenses, grow your savings, and stay in control ✨";
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

    transactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${t.category} - ₹${t.amount}</span>
        <div>
          <button onclick="editTransaction('${t._id}','${t.category}',${t.amount},'${t.type}')">✏️</button>
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
   CHARTS (DARK MODE FIXED)
========================= */
function renderCharts(transactions, income, expense) {
  const savings = income - expense;
  const isDark = document.body.classList.contains("dark");

  const textColor = isDark ? "#ffffff" : "#333";
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb";

  /* -------- PIE CHART -------- */
  const expenseMap = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
  });

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{
        data: Object.values(expenseMap),
        backgroundColor: ["#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#bdb2ff"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    }
  });

  /* -------- BAR CHART -------- */
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [{
        label: "₹ Amount",
        data: [income, expense, savings],
        backgroundColor: ["#86efac","#fca5a5","#a5b4fc"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });

  /* -------- LINE CHART -------- */
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
        borderColor: "#bfa7f3",
        backgroundColor: "transparent",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });
}

/* =========================
   CRUD
========================= */
async function addTransaction() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  if (!amount) return alert("Enter amount");

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

  loadTransactions();
}

async function editTransaction(id, cat, amt, type) {
  const newAmt = prompt("Edit amount:", amt);
  if (!newAmt) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Number(newAmt), category: cat, type })
  });

  loadTransactions();
}

async function deleteTransaction(id) {
  if (!confirm("Delete transaction?")) return;
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/* =========================
   THEME
========================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
  loadTransactions(); // redraw charts with correct colors
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

loadTransactions();
