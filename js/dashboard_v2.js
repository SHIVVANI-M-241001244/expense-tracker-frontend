console.log("DASHBOARD JS LOADED");

/* ================= AUTH ================= */
const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user._id) {
  alert("Invalid user. Please login again.");
  window.location.href = "login.html";
}

const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

let pieChart, barChart, lineChart;

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
  "Track your money mindfully and watch your savings grow ✨";

/* ================= LOAD TRANSACTIONS ================= */
async function loadTransactions() {
  try {
    const res = await fetch(`${API}/${user._id}`);
    const transactions = await res.json();

    let income = 0;
    let expense = 0;

    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    transactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      const li = document.createElement("li");
      li.innerHTML = `<span>${t.category} – ₹${t.amount}</span>`;
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

/* ================= ADD TRANSACTION ================= */
async function addTransaction() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  if (!amount) {
    alert("Enter amount");
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

/* ================= CHARTS ================= */
function renderCharts(transactions, income, expense) {
  const savings = income - expense;

  const expenseMap = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
  });

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieChartEl(), {
    type: "pie",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{
        data: Object.values(expenseMap),
        backgroundColor: ["#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#bdb2ff"]
      }]
    },
    options: { maintainAspectRatio: false }
  });

  if (barChart) barChart.destroy();
  barChart = new Chart(barChartEl(), {
    type: "bar",
    data: {
      labels: ["Income","Expense","Savings"],
      datasets: [{
        data: [income, expense, savings],
        backgroundColor: ["#86efac","#fca5a5","#a5b4fc"]
      }]
    },
    options: { maintainAspectRatio: false }
  });

  let running = 0;
  const trend = [];
  transactions.forEach(t => {
    running += t.type === "income" ? t.amount : -t.amount;
    trend.push(running);
  });

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(lineChartEl(), {
    type: "line",
    data: {
      labels: trend.map((_,i)=>`T${i+1}`),
      datasets: [{
        data: trend,
        borderColor: "#bfa7f3",
        tension: 0.3
      }]
    },
    options: { maintainAspectRatio: false }
  });
}

function pieChartEl(){ return document.getElementById("pieChart"); }
function barChartEl(){ return document.getElementById("barChart"); }
function lineChartEl(){ return document.getElementById("lineChart"); }

/* ================= THEME ================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
  loadTransactions();
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

loadTransactions();
