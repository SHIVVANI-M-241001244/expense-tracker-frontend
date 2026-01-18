console.log("DASHBOARD JS LOADED");

/* =========================
   AUTH CHECK
========================= */
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user._id) {
  alert("Invalid user. Please login again.");
  window.location.href = "login.html";
}

/* =========================
   API
========================= */
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/* =========================
   GREETING
========================= */
const greetingText = document.getElementById("greetingText");
const greetingMsg = document.getElementById("greetingMsg");

const hour = new Date().getHours();
let greeting = "";
let message = "";

if (hour < 12) {
  greeting = "Good Morning";
  message = "Start your day by tracking your expenses mindfully ✨";
} else if (hour < 17) {
  greeting = "Good Afternoon";
  message = "A small check today keeps your finances healthy 💜";
} else {
  greeting = "Good Evening";
  message = "Review your spending and save smarter 🌙";
}

greetingText.innerText = `${greeting}, ${user.name}`;
greetingMsg.innerText = message;

/* =========================
   LOAD TRANSACTIONS
========================= */
async function loadTransactions() {
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
}

/* =========================
   ADD
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
   EDIT
========================= */
async function editTransaction(id, oldCategory, oldAmount, type) {
  const newCategory =
    type === "income" ? "Income" : prompt("Edit category:", oldCategory);
  const newAmount = prompt("Edit amount:", oldAmount);

  if (!newAmount) return;

  await fetch(`${API}/${id}`, {
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
   DELETE
========================= */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  await fetch(`${API}/${id}`, { method: "DELETE" });
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
