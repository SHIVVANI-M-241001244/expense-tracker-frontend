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

  if (data.length > 0) {
  const t = data[data.length - 1]; // LAST transaction only

  t.type === "income" ? income += t.amount : expense += t.amount;

  const li = document.createElement("li");
  li.innerHTML = `
    <span>
      ${t.type === "income" ? "💰" : "💸"}
      ${t.category} – ₹${t.amount}
    </span>
    <div class="tx-actions">
      <button onclick="editTransaction('${t._id}', ${t.amount})">✏️</button>
      <button onclick="deleteTransaction('${t._id}')">🗑</button>
    </div>
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

/* EDIT */
async function editTransaction(id, oldAmount) {
  const val = prompt("New amount", oldAmount);
  if (!val) return;
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Number(val) })
  });
  loadTransactions();
}

/* DELETE */
async function deleteTransaction(id) {
  if (!confirm("Delete transaction?")) return;
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}
function renderCharts(data, income, expense) {
  const savings = income - expense;

  // Destroy old charts safely
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
  if (lineChart) lineChart.destroy();

  /* ===== EXPENSE MAP ===== */
  const expenseMap = {};
  data
    .filter(t => t.type === "expense")
    .forEach(t => {
      expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
    });

  const isDark = document.body.classList.contains("dark");
  const textColor = isDark ? "#f8fafc" : "#1f2937";
  const gridColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

  /* ===== PIE CHART ===== */
  const pieCanvas = document.getElementById("pieChart");
  if (pieCanvas) {
    pieChart = new Chart(pieCanvas.getContext("2d"), {
      type: "pie",
      data: {
        labels: Object.keys(expenseMap),
        datasets: [{
          data: Object.values(expenseMap),
          backgroundColor: [
            "#fde2e4",
            "#e0f2fe",
            "#ede9fe",
            "#dcfce7",
            "#fef3c7"
          ],
          borderWidth: 1
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
              font: {
                size: 14,
                weight: "600"
              },
              padding: 16
            }
          }
        }
      }
    });
  }

  /* ===== BAR CHART ===== */
  const barCanvas = document.getElementById("barChart");
  if (barCanvas) {
    barChart = new Chart(barCanvas.getContext("2d"), {
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
          x: {
            ticks: {
              color: textColor,
              font: { weight: "600" }
            },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: textColor,
              font: { weight: "600" }
            },
            grid: { color: gridColor }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  /* ===== LINE CHART ===== */
  let running = 0;
  const trend = [];
  data.forEach(t => {
    running += t.type === "income" ? t.amount : -t.amount;
    trend.push(running);
  });

  const lineCanvas = document.getElementById("lineChart");
  if (lineCanvas) {
    lineChart = new Chart(lineCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: trend.map((_, i) => `T${i + 1}`),
        datasets: [{
          data: trend,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,0.25)",
          borderWidth: 3,
          pointRadius: 4,
          tension: 0.35,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: textColor,
              font: { weight: "600" }
            },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: textColor,
              font: { weight: "600" }
            },
            grid: { color: gridColor }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
