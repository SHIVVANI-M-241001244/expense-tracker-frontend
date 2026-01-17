// STOP if not on dashboard page
if (!document.getElementById("transactionList")) return;

const API_URL =
  "https://shivvani-m-expense-backend.onrender.com/api/transactions";

// Get logged-in user
const user = JSON.parse(localStorage.getItem("user"));

// Protect dashboard
if (!user) window.location.href = "login.html";

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

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

/* =========================
   BUDGET
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

  status.innerText =
    expense > Number(budget)
      ? "⚠️ Budget exceeded!"
      : "✅ Within budget";
}

/* =========================
   ADD TRANSACTION
========================= */
async function addTransaction() {
  const btn = document.getElementById("addBtn");
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value.trim();
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  if (!category || !amount) {
    alert("Please fill all required fields");
    return;
  }

  try {
    btn.innerText = "Adding...";
    btn.disabled = true;

    const res = await fetch(`${API_URL}/add`, {
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

    if (!res.ok) throw new Error("Failed");

    btn.innerText = "Added ✅";

    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";

    loadTransactions();
    if (typeof loadCharts === "function") loadCharts();

    setTimeout(() => {
      btn.innerText = "Add";
      btn.disabled = false;
    }, 800);
  } catch (error) {
    console.error(error);
    alert("Failed to add transaction ❌");
    btn.innerText = "Add";
    btn.disabled = false;
  }
}

/* =========================
   LOAD TRANSACTIONS
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
      if (new Date(t.createdAt).getMonth() !== currentMonth) return;

      t.type === "income"
        ? (income += t.amount)
        : (expense += t.amount);

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${t.category}</span>
        <span class="${t.type}">
          ${t.type === "income" ? "+" : "-"}₹${t.amount}
        </span>
        <button onclick="editTransaction('${t._id}','${t.category}',${t.amount},'${t.type}')">✏️</button>
        <button onclick="deleteTransaction('${t._id}')">🗑️</button>
      `;
      list.appendChild(li);
    });

    document.getElementById("totalIncome").innerText = `₹${income}`;
    document.getElementById("totalExpense").innerText = `₹${expense}`;
    document.getElementById("balance").innerText = `₹${income - expense}`;

    checkBudget(expense);
  } catch (error) {
    console.error("Load failed", error);
  }
}

/* =========================
   DELETE
========================= */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/* =========================
   EDIT
========================= */
async function editTransaction(id, category, amount, type) {
  const newCategory = prompt("Edit category:", category);
  const newAmount = prompt("Edit amount:", amount);
  if (!newCategory || !newAmount) return;

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
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* =========================
   INIT
========================= */
loadTransactions();
