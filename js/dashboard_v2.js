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
   DARK MODE LOAD
========================= */
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

/* =========================
   GREETING
========================= */
const greetingText = document.getElementById("greetingText");
const greetingMsg = document.getElementById("greetingMsg");

if (greetingText && greetingMsg) {
  const hour = new Date().getHours();
  let greet = "Good Morning";
  if (hour >= 12 && hour < 17) greet = "Good Afternoon";
  else if (hour >= 17) greet = "Good Evening";

  greetingText.innerText = `${greet}, ${user.name} 💜`;
  greetingMsg.innerText =
    "Track your money smartly and build better savings ✨";
}

/* =========================
   CHART INSTANCES
========================= */
let pieChart, barChart, lineChart;

/* =========================
   LOAD TRANSACTIONS
========================= */
async function loadTransactions() {
  const res = await fetch(`${API}/${user._id}`);
  const transactions = await res.json();

  let income = 0;
  let expense = 0;
  let balance = 0;

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

  balance = income - expense;

  document.getElementById("totalIncome").innerText = `₹${income}`;
  document.getElementById("totalExpense").innerText = `₹${expense}`;
  document.getElementById("balance").innerText = `₹${balance}`;

  renderCharts(transactions, income, expense, balance);
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
      note,
    }),
  });

  document.getElementById("amount").value = "";
  document.getElementById("note").value = "";
  document.getElementById("category").value = "";

  loadTransactions();
}

/* =========================
   EDIT
========================= */
async function editTransaction(id, oldCategory, oldAmount, type) {
  let newCategory = oldCategory;
  if (type === "expense") {
    newCategory = prompt("Edit category:", oldCategory);
    if (!newCategory) return;
  }

  const newAmount = prompt("Edit amount:", oldAmount);
  if (!newAmount) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: newCategory,
      amount: Number(newAmount),
      type,
    }),
  });

  loadTransactions();
}

/* =========================
   DELETE
========================= */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/* =========================
   CHART RENDERING
========================= */
function renderCharts(transactions, income, expense, balance) {
  /* ---------- PIE (EXPENSE BY CATEGORY) ---------- */
  const expenseMap = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseMap[t.category] =
        (expenseMap[t.category] || 0) + t.amount;
    });

  const pieLabels = Object.keys(expenseMap);
  const pieData = Object.values(expenseMap);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById("expensePie"), {
    type: "pie",
    data: {
      labels: pieLabels,
      datasets: [
        {
          data: pieData,
          backgroundColor: [
            "#fbcfe8",
            "#ddd6fe",
            "#bbf7d0",
            "#fde68a",
            "#bfdbfe",
          ],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: { color: getComputedStyle(document.body).color },
        },
      },
    },
  });

  /* ---------- BAR (INCOME / EXPENSE / SAVINGS) ---------- */
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("summaryBar"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [
        {
          data: [income, expense, balance],
          backgroundColor: ["#bbf7d0", "#fecaca", "#c7d2fe"],
        },
      ],
    },
    options: {
      scales: {
        y: {
          ticks: { color: getComputedStyle(document.body).color },
        },
        x: {
          ticks: { color: getComputedStyle(document.body).color },
        },
      },
    },
  });

  /* ---------- LINE (BALANCE TREND) ---------- */
  let runningBalance = 0;
  const trend = transactions.map((t) => {
    runningBalance += t.type === "income" ? t.amount : -t.amount;
    return runningBalance;
  });

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
      labels: trend.map((_, i) => `T${i + 1}`),
      datasets: [
        {
          label: "Balance",
          data: trend,
          borderColor: "#a5b4fc",
          tension: 0.4,
        },
      ],
    },
    options: {
      scales: {
        y: {
          ticks: { color: getComputedStyle(document.body).color },
        },
        x: {
          ticks: { color: getComputedStyle(document.body).color },
        },
      },
    },
  });
}

/* =========================
   THEME TOGGLE
========================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
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
