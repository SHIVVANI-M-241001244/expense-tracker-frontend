console.log("DASHBOARD JS LOADED");

/* =========================
   AUTH
========================= */
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user._id) {
  alert("Invalid user. Please login again.");
  window.location.href = "login.html";
}

const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/* =========================
   GREETING
========================= */
const greetingText = document.getElementById("greetingText");
const greetingMsg = document.getElementById("greetingMsg");

const hour = new Date().getHours();
let greet = "";
let msg = "";

if (hour < 12) {
  greet = "Good Morning";
  msg = "Start your day by tracking your expenses mindfully ✨";
} else if (hour < 17) {
  greet = "Good Afternoon";
  msg = "A small check today keeps your finances healthy 💜";
} else {
  greet = "Good Evening";
  msg = "Review your spending and save smarter 🌙";
}

greetingText.innerText = `${greet}, ${user.name}`;
greetingMsg.innerText = msg;

/* =========================
   GLOBAL STATE
========================= */
let allTransactions = [];

/* =========================
   LOAD TRANSACTIONS
========================= */
async function loadTransactions() {
  try {
    const res = await fetch(`${API}/${user._id}`);
    if (!res.ok) throw new Error("Fetch failed");

    allTransactions = await res.json();

    let income = 0;
    let expense = 0;

    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    allTransactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

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

    renderCharts(allTransactions, income, expense);
  } catch (err) {
    console.error(err);
    alert("Failed to load transactions");
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

  if (!amount || (type === "expense" && !category)) {
    alert("Fill all required fields");
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

  loadTransactions();
}

/* =========================
   EDIT (FIXED)
========================= */
async function editTransaction(id, oldCategory, oldAmount, type) {
  console.log("EDIT ID:", id);

  const newAmount = prompt("Edit amount:", oldAmount);
  if (!newAmount) return;

  const newCategory =
    type === "income" ? "Income" : prompt("Edit category:", oldCategory);

  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: newCategory,
      amount: Number(newAmount),
      type,
    }),
  });

  if (!res.ok) {
    alert("Update failed");
    return;
  }

  loadTransactions();
}

/* =========================
   DELETE (FIXED)
========================= */
async function deleteTransaction(id) {
  console.log("DELETE ID:", id);

  if (!confirm("Delete this transaction?")) return;

  const res = await fetch(`${API}/${id}`, { method: "DELETE" });

  if (!res.ok) {
    alert("Delete failed");
    return;
  }

  loadTransactions();
}

/* =========================
   DARK MODE
========================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

loadTransactions();
