console.log("DASHBOARD LOADED");

/* ================= AUTH ================= */
const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user._id) {
  alert("Please login again");
  location.href = "login.html";
}

/* ================= API ================= */
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

let pieChart, barChart, lineChart;

/* ================= GREETING ================= */
const greetingText = document.getElementById("greetingText");
const greetingMsg = document.getElementById("greetingMsg");

const hour = new Date().getHours();
greetingText.innerText =
  hour < 12 ? `Good Morning, ${user.name}` :
  hour < 17 ? `Good Afternoon, ${user.name}` :
  `Good Evening, ${user.name}`;

greetingMsg.innerText = "Track smart, spend wiser 🌱";

/* ================= LOAD TRANSACTIONS ================= */
async function loadTransactions() {
  const res = await fetch(`${API}/${user._id}`);
  const data = await res.json();

  let income = 0, expense = 0;
  transactionList.innerHTML = "";

  data.forEach(t => {
    t.type === "income" ? income += t.amount : expense += t.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.category} – ₹${t.amount}</span>
      <div class="tx-actions">
        <button class="edit-btn" onclick="editTransaction('${t._id}', ${t.amount})">✏️</button>
        <button class="delete-btn" onclick="deleteTransaction('${t._id}')">🗑</button>
      </div>
    `;
    transactionList.appendChild(li);
  });

  totalIncome.innerText = `₹${income}`;
  totalExpense.innerText = `₹${expense}`;
  balance.innerText = `₹${income - expense}`;

  renderCharts(data, income, expense);
  updateBudgetStatus();
}

/* ================= ADD ================= */
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

/* ================= EDIT ================= */
async function editTransaction(id, oldAmount) {
  const val = prompt("Enter new amount", oldAmount);
  if (!val) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Number(val) })
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
function renderCharts(data, income, expense) {
  const savings = income - expense;

  pieChart?.destroy();
  barChart?.destroy();
  lineChart?.destroy();

  /* PIE DATA */
  const expMap = {};
  data.filter(t => t.type === "expense")
      .forEach(t => expMap[t.category] = (expMap[t.category] || 0) + t.amount);

  /* PIE */
  pieChart = new Chart(pieChart.getContext("2d"), {
    type: "pie",
    data: {
      labels: Object.keys(expMap),
      datasets: [{
        data: Object.values(expMap),
        backgroundColor: ["#FFE5EC","#E0FBFC","#EAE4FF","#FFF1C1","#DCFCE7","#FDE2E4"]
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  /* BAR */
  barChart = new Chart(barChart.getContext("2d"), {
    type: "bar",
    data: {
      labels: ["Income","Expense","Savings"],
      datasets: [{
        data: [income, expense, savings],
        backgroundColor: ["#22c55e","#ef4444","#6366f1"],
        borderRadius: 10
      }]
    },
    options: { plugins:{legend:{display:false}}, responsive:true }
  });

  /* LINE */
  let running = 0;
  const trend = [];
  data.forEach(t => {
    running += t.type === "income" ? t.amount : -t.amount;
    trend.push(running);
  });

  lineChart = new Chart(lineChart.getContext("2d"), {
    type: "line",
    data: {
      labels: trend.map((_,i)=>`T${i+1}`),
      datasets: [{
        data: trend,
        borderColor:"#6366f1",
        fill:true,
        tension:0.35
      }]
    },
    options: { responsive:true }
  });
}

/* ================= BUDGET ================= */
function saveBudget() {
  localStorage.setItem("budget", budgetInput.value);
  updateBudgetStatus();
}

function updateBudgetStatus() {
  const budget = Number(localStorage.getItem("budget"));
  if (!budget) return;

  const expense = Number(totalExpense.innerText.replace("₹",""));
  const remaining = budget - expense;

  budgetStatus.innerText =
    remaining < 0
      ? `⚠️ Budget exceeded by ₹${Math.abs(remaining)}`
      : `✅ ₹${remaining} left from your budget`;

  budgetStatus.className = remaining < 0 ? "budget-status over" : "budget-status safe";
}

/* ================= THEME ================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  location.href = "login.html";
}

loadTransactions();
