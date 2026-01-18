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
  greetingMsg.innerText =
    "Track your expenses, grow your savings, and stay in control ✨";
}

/* =========================
   THEME TOGGLE
========================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* =========================
   CHART VARIABLES
========================= */
let expensePieChart = null;
let summaryBarChart = null;
let trendLineChart = null;

/* =========================
   LOAD TRANSACTIONS
========================= */
async function loadTransactions() {
  try {
    const res = await fetch(`${API}/${user._id}`);
    const transactions = await res.json();

    let income = 0;
    let expense = 0;
    let balanceTrend = [];
    let expenseCategories = {};

    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    transactions.forEach((t) => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;
        expenseCategories[t.category] =
          (expenseCategories[t.category] || 0) + t.amount;
      }

      balanceTrend.push(income - expense);

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${t.category} - ₹${t.amount}</span>
        <span>
          <button onclick="editTransaction(
            '${t._id}',
            '${t.category}',
            ${t.amount},
            '${t.type}'
          )">✏️</button>
          <button onclick="deleteTransaction('${t._id}')">🗑️</button>
        </span>
      `;
      list.appendChild(li);
    });

    document.getElementById("totalIncome").innerText = `₹${income}`;
    document.getElementById("totalExpense").innerText = `₹${expense}`;
    document.getElementById("balance").innerText = `₹${income - expense}`;

    renderCharts(expenseCategories, income, expense, balanceTrend);
  } catch (err) {
    console.error(err);
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
    alert("Please fill all required fields");
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
   EDIT TRANSACTION
========================= */
async function editTransaction(id, oldCategory, oldAmount, type) {
  const newAmount = prompt("Edit amount:", oldAmount);
  if (!newAmount) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: oldCategory,
      amount: Number(newAmount),
      type,
    }),
  });

  loadTransactions();
}

/* =========================
   DELETE TRANSACTION
========================= */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/* =========================
   CHARTS
========================= */
function renderCharts(categories, income, expense, trend) {
  expensePieChart?.destroy();
  summaryBarChart?.destroy();
  trendLineChart?.destroy();

  /* EXPENSE PIE */
  expensePieChart = new Chart(
    document.getElementById("expensePie"),
    {
      type: "pie",
      data: {
        labels: Object.keys(categories),
        datasets: [
          {
            data: Object.values(categories),
            backgroundColor: [
              "#ffb4b4",
              "#ffd6a5",
              "#caffbf",
              "#bdb2ff",
              "#ffc6ff",
            ],
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    }
  );

  /* SUMMARY BAR */
  summaryBarChart = new Chart(
    document.getElementById("summaryBar"),
    {
      type: "bar",
      data: {
        labels: ["Income", "Expense", "Savings"],
        datasets: [
          {
            data: [income, expense, income - expense],
            backgroundColor: ["#caffbf", "#ffb4b4", "#bdb2ff"],
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    }
  );

  /* TREND LINE */
  trendLineChart = new Chart(
    document.getElementById("trendChart"),
    {
      type: "line",
      data: {
        labels: trend.map((_, i) => i + 1),
        datasets: [
          {
            data: trend,
            borderColor: "#b8b5ff",
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    }
  );
}

/* =========================
   INIT
========================= */
loadTransactions();
