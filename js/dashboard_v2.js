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

  data.forEach(t => {
    t.type === "income" ? income += t.amount : expense += t.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.category} – ₹${t.amount}</span>
      <div class="tx-actions">
        <button onclick="editTransaction('${t._id}', ${t.amount})">✏️</button>
        <button onclick="deleteTransaction('${t._id}')">🗑</button>
      </div>
    `;
    list.appendChild(li);
  });

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

/* CHARTS */
function renderCharts(data, income, expense) {
  const savings = income - expense;

  pieChart?.destroy();
  barChart?.destroy();
  lineChart?.destroy();

  const expenseMap = {};
  data.filter(t => t.type === "expense")
    .forEach(t => expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount);

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{
        data: Object.values(expenseMap),
        backgroundColor: ["#fde2e4","#e0f2fe","#ede9fe","#dcfce7"]
      }]
    }
  });

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Income","Expense","Savings"],
      datasets: [{
        data: [income, expense, savings],
        backgroundColor: ["#86efac","#fca5a5","#a5b4fc"]
      }]
    }
  });

  let running = 0;
  const trend = [];
  data.forEach(t => {
    running += t.type === "income" ? t.amount : -t.amount;
    trend.push(running);
  });

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: trend.map((_,i)=>`T${i+1}`),
      datasets: [{
        data: trend,
        borderColor: "#6366f1",
        fill: false
      }]
    }
  });
}

/* BUDGET */
function saveBudget() {
  localStorage.setItem("budget", budgetInput.value);
  alert("Budget saved");
}

function updateBudgetStatus(expense) {
  const budget = Number(localStorage.getItem("budget"));
  if (!budget) return;

  const left = budget - expense;
  budgetStatus.innerText =
    left < 0 ? `⚠ Exceeded by ₹${Math.abs(left)}` : `₹${left} left`;
}

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* LOGOUT */
function logout() {
  localStorage.clear();
  location.href = "login.html";
}

loadTransactions();
