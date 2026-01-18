console.log("DASHBOARD V2 LOADED");

/* AUTH */
const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user._id) {
  alert("Please login again");
  location.href = "login.html";
}

/* API */
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

let pieChart, barChart, lineChart;

/* GREETING */
const hour = new Date().getHours();
greetingText.innerText =
  hour < 12 ? `Good Morning, ${user.name}` :
  hour < 17 ? `Good Afternoon, ${user.name}` :
  `Good Evening, ${user.name}`;
greetingMsg.innerText = "Track smart, spend wiser 🌱";

/* LOAD TRANSACTIONS */
async function loadTransactions() {
  const res = await fetch(`${API}/${user._id}`);
  const data = await res.json();

  let income = 0, expense = 0;
  transactionList.innerHTML = "";

  data.forEach(t => {
    t.type === "income" ? income += t.amount : expense += t.amount;

    const li = document.createElement("li");
    li.innerHTML = `<span>${t.category} – ₹${t.amount}</span>`;
    transactionList.appendChild(li);
  });

  totalIncome.innerText = `₹${income}`;
  totalExpense.innerText = `₹${expense}`;
  balance.innerText = `₹${income - expense}`;

  renderCharts(data, income, expense);
  updateBudgetStatus();
}

/* ADD */
async function addTransaction() {
  await fetch(`${API}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user._id,
      type: type.value,
      category: type.value === "income" ? "Income" : category.value,
      amount: Number(amount.value),
      note: note.value
    })
  });
  amount.value = note.value = "";
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

  pieChart = new Chart(pieChart.getContext("2d"), {
    type: "pie",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{
        data: Object.values(expenseMap),
        backgroundColor: ["#ffd6e0","#caffbf","#bdb2ff","#fdffb6","#a0c4ff"]
      }]
    }
  });

  barChart = new Chart(barChart.getContext("2d"), {
    type: "bar",
    data: {
      labels: ["Income","Expense","Savings"],
      datasets: [{
        data: [income, expense, savings],
        backgroundColor: ["#22c55e","#ef4444","#6366f1"]
      }]
    }
  });

  let running = 0;
  const trend = data.map(t => running += t.type === "income" ? t.amount : -t.amount);

  lineChart = new Chart(lineChart.getContext("2d"), {
    type: "line",
    data: {
      labels: trend.map((_,i)=>`T${i+1}`),
      datasets: [{
        data: trend,
        borderColor: "#6366f1",
        fill: true
      }]
    }
  });
}

/* BUDGET */
function saveBudget() {
  localStorage.setItem("budget", budgetInput.value);
  updateBudgetStatus();
}

function updateBudgetStatus() {
  const budget = Number(localStorage.getItem("budget"));
  if (!budget) return;

  const spent = Number(totalExpense.innerText.replace("₹",""));
  const remaining = budget - spent;

  budgetStatus.innerText =
    remaining < 0
      ? `⚠️ Exceeded by ₹${Math.abs(remaining)}`
      : `✅ ₹${remaining} left`;
  budgetStatus.className = "budget-status " + (remaining < 0 ? "over" : "safe");
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
