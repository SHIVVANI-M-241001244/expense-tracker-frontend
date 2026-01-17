// STOP if not on dashboard page
if (!document.getElementById("transactionList")) {
  return;
}
const API_URL =
  "https://shivvani-m-expense-backend.onrender.com/api/transactions";

// Get logged-in user
const user = JSON.parse(localStorage.getItem("user"));

// Protect dashboard
if (!user) {
  window.location.href = "login.html";
}

/* =========================
   DARK MODE
========================= */
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
}

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

/* =========================
   BUDGET FEATURE
========================= */
function saveBudget() {
  const budget = document.getElementById("budgetInput").value;
  if (!budget) return alert("Enter a budget amount");
  localStorage.setItem("budget", budget);
  alert("Budget saved ✅");
}

function checkBudget(expense) {
  const budget = localStorage.getItem("budget");
  const status = document.getElementById("budgetStatus");

  if (!budget || !status) return;

  if (expense > Number(budget)) {
    status.innerText = "⚠️ Budget exceeded!";
  } else {
    status.innerText = "✅ Within budget";
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

  if (!category || !amount) {
    alert("Please fill all required fields");
    return;
  }

  try {
    await fetch(`${API_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        type,
        category,
        amount: Number(amount),
        note,
      }),
    });

    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";

    loadTransactions();
    if (typeof loadCharts === "function") loadCharts();
  } catch (error) {
    console.error(error);
    alert("Failed to add transaction ❌");
  }
}

/* =========================
   LOAD TRANSACTIONS
   (MONTHLY REPORT)
========================= */
async function loadTransactions() {
  try {
    const res = await fetch(`${API_URL}/${user.id}`);
    const transactions = await res.json();

    let income = 0;
    let expense = 0;

    const currentMonth = new Date().getMonth();
    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    transactions.forEach((t) => {
      const txMonth = new Date(t.createdAt).getMonth();
      if (txMonth !== currentMonth) return; // monthly filter

      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${t.category}</span>
        <span class="${t.type}">
          ${t.type === "income" ? "+" : "-"}₹${t.amount}
        </span>
        <button onclick="editTransaction(
          '${t._id}',
          '${t.category}',
          ${t.amount},
          '${t.type}'
        )">✏️</button>
        <button onclick="deleteTransaction('${t._id}')">🗑️</button>
      `;
      list.appendChild(li);
    });

    document.getElementById("totalIncome").innerText = `₹${income}`;
    document.getElementById("totalExpense").innerText = `₹${expense}`;
    document.getElementById("balance").innerText = `₹${income - expense}`;

    checkBudget(expense);
  } catch (error) {
    console.error("Failed to load transactions", error);
  }
}

/* =========================
   DELETE TRANSACTION
========================= */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    loadTransactions();
    if (typeof loadCharts === "function") loadCharts();
  } catch (error) {
    console.error(error);
    alert("Delete failed ❌");
  }
}

/* =========================
   EDIT TRANSACTION
========================= */
async function editTransaction(id, category, amount, type) {
  const newCategory = prompt("Edit category:", category);
  const newAmount = prompt("Edit amount:", amount);

  if (!newCategory || !newAmount) return;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: newCategory,
        amount: Number(newAmount),
        type,
      }),
    });

    loadTransactions();
    if (typeof loadCharts === "function") loadCharts();
  } catch (error) {
    console.error(error);
    alert("Update failed ❌");
  }
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* =========================
   INITIAL LOAD
========================= */
loadTransactions();
