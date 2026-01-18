console.log("DASHBOARD LOADED");

/* ================= AUTH ================= */
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user._id) {
  alert("Please login again");
  window.location.href = "login.html";
}

/* ================= API ================= */
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/* ================= GREETING ================= */
const greetingText = document.getElementById("greetingText");
const greetingMsg = document.getElementById("greetingMsg");

const hour = new Date().getHours();
const greet =
  hour < 12 ? "Good Morning" :
  hour < 17 ? "Good Afternoon" :
  "Good Evening";

greetingText.innerText = `${greet}, ${user.name} 💜`;
greetingMsg.innerText =
  "Track your expenses, grow your savings, and stay in control ✨";

/* ================= THEME ================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ================= CHART VARS ================= */
let pieChart, barChart, lineChart;

/* ================= LOAD TRANSACTIONS ================= */
async function loadTransactions() {
  const res = await fetch(`${API}/${user._id}`);
  const transactions = await res.json();

  let income = 0, expense = 0;
  let categories = {};
  let balanceTrend = [];

  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  transactions.forEach((t, index) => {
    if (t.type === "income") income += t.amount;
    else {
      expense += t.amount;
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }

    balanceTrend.push(income - expense);

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.category} — ₹${t.amount}</span>
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

  renderCharts(categories, income, expense, income - expense, balanceTrend);
}

/* ================= ADD ================= */
async function addTransaction() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  if (!amount || (type === "expense" && !category)) return;

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

/* ================= EDIT ================= */
async function editTransaction(id, cat, amt, type) {
  const newAmt = prompt("Edit amount:", amt);
  if (!newAmt) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Number(newAmt) })
  });

  loadTransactions();
}

/* ================= DELETE ================= */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/* ================= CHARTS ================= */
function renderCharts(categories, income, expense, savings, trend) {

  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
  if (lineChart) lineChart.destroy();

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          "#ffd6e0",
          "#cdb4db",
          "#bde0fe",
          "#ffc8a2",
          "#caffbf"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [{
        label: "Amount (₹)",
        data: [income, expense, savings],
        backgroundColor: ["#b8f2d5", "#ffb3b3", "#c7d2fe"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: trend.map((_, i) => `T${i + 1}`),
      datasets: [{
        label: "Balance",
        data: trend,
        borderColor: "#bfa7f3",
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

/* ================= INIT ================= */
loadTransactions();
