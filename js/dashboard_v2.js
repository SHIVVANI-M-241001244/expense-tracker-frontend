console.log("DASHBOARD JS LOADED");

const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user._id) {
  alert("Please login again");
  window.location.href = "login.html";
}

const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

let pieChart, barChart, lineChart;

/* GREETING */
const hour = new Date().getHours();
document.getElementById("greetingText").innerText =
  `${hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"}, ${user.name} 💜`;

/* LOAD TRANSACTIONS */
async function loadTransactions() {
  const res = await fetch(`${API}/${user._id}`);
  const transactions = await res.json();

  let income = 0, expense = 0;
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;

    const li = document.createElement("li");
    li.innerHTML = `${t.category} – ₹${t.amount}`;
    list.appendChild(li);
  });

  document.getElementById("totalIncome").innerText = `₹${income}`;
  document.getElementById("totalExpense").innerText = `₹${expense}`;
  document.getElementById("balance").innerText = `₹${income - expense}`;

  renderCharts(transactions, income, expense);
}

/* ADD */
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

  document.getElementById("amount").value = "";
  document.getElementById("note").value = "";
  loadTransactions();
}

/* CHARTS */
function renderCharts(transactions, income, expense) {
  const savings = income - expense;

  const expenseMap = {};
  transactions.filter(t => t.type === "expense")
    .forEach(t => expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount);

  pieChart?.destroy();
  pieChart = new Chart(pieChartEl(), {
    type: "pie",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{ data: Object.values(expenseMap) }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  barChart?.destroy();
  barChart = new Chart(barChartEl(), {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [{ data: [income, expense, savings] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  lineChart?.destroy();
  let run = 0;
  const trend = transactions.map(t => run += t.type === "income" ? t.amount : -t.amount);

  lineChart = new Chart(lineChartEl(), {
    type: "line",
    data: { labels: trend.map((_, i) => i + 1), datasets: [{ data: trend }] },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

const pieChartEl = () => document.getElementById("pieChart");
const barChartEl = () => document.getElementById("barChart");
const lineChartEl = () => document.getElementById("lineChart");

/* THEME & LOGOUT */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

loadTransactions();

window.addTransaction = addTransaction;
window.toggleTheme = toggleTheme;
window.logout = logout;

