/************************************************
 * DASHBOARD.JS – FINAL STABLE VERSION
 ************************************************/

/* ========== DARK MODE ========== */
if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "dark",
    document.body.classList.contains("dark")
  );
}

/* ========== AUTH / USER ========== */
const storedUser = localStorage.getItem("user");

if (!storedUser) {
  alert("Please login again");
  window.location.href = "login.html";
}

const user = JSON.parse(storedUser);

/* IMPORTANT FIX: support both id and _id */
const userId = user._id || user.id;

if (!userId) {
  alert("Invalid user. Please login again.");
  localStorage.clear();
  window.location.href = "login.html";
}

/* ========== GREETING ========== */
const usernameEl = document.getElementById("username");
const greetingTextEl = document.getElementById("greetingText");
const greetingSubEl = document.getElementById("greetingSub");

if (usernameEl) usernameEl.innerText = user.name || "User";

function setGreeting() {
  const hour = new Date().getHours();
  let greeting = "Hello";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  if (greetingTextEl) {
    greetingTextEl.innerText = `${greeting}, ${user.name} 💜`;
  }

  if (greetingSubEl) {
    greetingSubEl.innerText = "Let’s track your finances beautifully ✨";
  }
}

setGreeting();

/* ========== API ========== */
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/* ========== ADD TRANSACTION ========== */
async function addTransaction() {
  const typeEl = document.getElementById("type");
  const categoryEl = document.getElementById("category");
  const amountEl = document.getElementById("amount");
  const noteEl = document.getElementById("note");

  const type = typeEl.value;
  const category = categoryEl.value;
  const amount = amountEl.value;
  const note = noteEl.value;

  if (!amount) {
    alert("Amount is required");
    return;
  }

  if (type === "expense" && !category) {
    alert("Please select a category");
    return;
  }

  const payload = {
    userId: userId,
    type: type,
    category: type === "income" ? "Income" : category,
    amount: Number(amount),
    note: note || ""
  };

  try {
    const res = await fetch(`${API}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Add failed");

    amountEl.value = "";
    noteEl.value = "";
    categoryEl.value = "";

    loadTransactions();
  } catch (err) {
    console.error(err);
    alert("Failed to add transaction ❌");
  }
}

/* ========== LOAD TRANSACTIONS ========== */
async function loadTransactions() {
  try {
    const res = await fetch(`${API}/${userId}`);
    if (!res.ok) throw new Error("Fetch failed");

    const transactions = await res.json();

    let income = 0;
    let expense = 0;

    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    transactions.forEach(tx => {
      if (tx.type === "income") income += tx.amount;
      else expense += tx.amount;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${tx.category}</span>
        <span class="${tx.type}">
          ${tx.type === "income" ? "+" : "-"}₹${tx.amount}
        </span>
        <div>
          <button onclick="editTransaction('${tx._id}', '${tx.category}', ${tx.amount}, '${tx.type}')">✏️</button>
          <button onclick="deleteTransaction('${tx._id}')">🗑️</button>
        </div>
      `;
      list.appendChild(li);
    });

    document.getElementById("totalIncome").innerText = `₹${income}`;
    document.getElementById("totalExpense").innerText = `₹${expense}`;
    document.getElementById("balance").innerText = `₹${income - expense}`;

    /* SEND DATA TO CHARTS */
    if (typeof renderCharts === "function") {
      renderCharts(transactions);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to load transactions ❌");
  }
}

/* ========== DELETE ========== */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Delete failed");

    loadTransactions();
  } catch (err) {
    console.error(err);
    alert("Delete failed ❌");
  }
}

/* ========== EDIT ========== */
async function editTransaction(id, category, amount, type) {
  const newCategory =
    type === "expense"
      ? prompt("Edit category:", category)
      : "Income";

  const newAmount = prompt("Edit amount:", amount);

  if (!newAmount || (type === "expense" && !newCategory)) return;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: newCategory,
        amount: Number(newAmount),
        type
      })
    });

    if (!res.ok) throw new Error("Update failed");

    loadTransactions();
  } catch (err) {
    console.error(err);
    alert("Update failed ❌");
  }
}

/* ========== LOGOUT ========== */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ========== INIT ========== */
loadTransactions();
