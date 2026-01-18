console.log("Dashboard loaded");

/* AUTH */
const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user._id) {
  alert("Invalid user. Please login again.");
  window.location.href = "login.html";
}

/* GREETING */
const greetingText = document.getElementById("greetingText");
const hour = new Date().getHours();
const greet =
  hour < 12 ? "Good Morning" :
  hour < 17 ? "Good Afternoon" :
  "Good Evening";
greetingText.innerText = `${greet}, ${user.name} 💜`;

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

/* API */
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/* GLOBAL CHARTS */
let pieChart, barChart, lineChart;

/* LOAD */
async function loadTransactions() {
  const res = await fetch(`${API}/${user._id}`);
  const transactions = await res.json();

  let income = 0, expense = 0;
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  transactions.forEach(t => {
    t.type === "income" ? income += t.amount : expense += t.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      ${t.category} - ₹${t.amount}
      <span>
        <button onclick="editTx('${t._id}','${t.category}',${t.amount},'${t.type}')">✏️</button>
        <button onclick="deleteTx('${t._id}')">🗑️</button>
      </span>
    `;
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

  if (!amount || (type === "expense" && !category)) {
    alert("Fill required fields");
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

  loadTransactions();
}

/* EDIT */
async function editTx(id, cat, amt, type) {
  const newAmount = prompt("Edit amount:", amt);
  if (!newAmount) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category: cat, amount: Number(newAmount), type })
  });

  loadTransactions();
}

/* DELETE */
async function deleteTx(id) {
  if (!confirm("Delete transaction?")) return;
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/* CHARTS */
function renderCharts(transactions, income, expense) {
  const savings = income - expense;

  const expMap = {};
  transactions.filter(t => t.type === "expense")
    .forEach(t => expMap[t.category] = (expMap[t.category] || 0) + t.amount);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieChartEl, {
    type: "pie",
    data: { labels: Object.keys(expMap), datasets: [{ data: Object.values(expMap) }] }
  });

  if (barChart) barChart.destroy();
  barChart = new Chart(barChartEl, {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [{ data: [income, expense, savings] }]
    }
  });
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

const pieChartEl = document.getElementById("pieChart");
const barChartEl = document.getElementById("barChart");
const lineChartEl = document.getElementById("lineChart");

loadTransactions();
