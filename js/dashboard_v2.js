console.log("DASHBOARD LOADED");

const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user._id) {
  alert("Invalid user. Please login again.");
  window.location.href = "login.html";
}

let pieChart, barChart, lineChart;

/* GREETING */
const hour = new Date().getHours();
const greet =
  hour < 12 ? "Good Morning" :
  hour < 17 ? "Good Afternoon" : "Good Evening";

document.getElementById("greetingText").innerText =
  `${greet}, ${user.name} 💜`;

document.getElementById("greetingMsg").innerText =
  "Track your expenses, grow your savings, and stay in control ✨";

/* LOAD TRANSACTIONS */
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
      <span>${t.category} - ₹${t.amount}</span>
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

  renderCharts(transactions, income, expense);
}

/* ADD */
async function addTransaction() {
  const type = type.value;
  const category = category.value;
  const amount = Number(amount.value);
  const note = note.value;

  if (!amount) return alert("Enter amount");

  await fetch(`${API}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user._id,
      type,
      category: type === "income" ? "Income" : category,
      amount,
      note
    })
  });

  loadTransactions();
}

/* EDIT */
async function editTransaction(id, cat, amt, type) {
  const newAmt = prompt("Edit amount", amt);
  if (!newAmt) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Number(newAmt), category: cat, type })
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
function renderCharts(transactions, income, expense) {

  const expenseMap = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
  });

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieChart.getContext("2d"), {
    type: "pie",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{
        data: Object.values(expenseMap),
        backgroundColor: ["#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#bdb2ff"]
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  if (barChart) barChart.destroy();
  barChart = new Chart(barChart.getContext("2d"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [{
        data: [income, expense, income - expense],
        backgroundColor: ["#b7e4c7", "#ffadad", "#a0c4ff"]
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* LOGOUT */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

loadTransactions();
