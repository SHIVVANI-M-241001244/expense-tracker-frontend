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

if (greetingText && greetingMsg) {
  const hour = new Date().getHours();
  let greet = "Good Morning";

  if (hour >= 12 && hour < 17) greet = "Good Afternoon";
  else if (hour >= 17) greet = "Good Evening";

  greetingText.innerText = `${greet}, ${user.name} 💜`;
  greetingMsg.innerText =
    "Track your expenses, grow your savings, and stay in control ✨";
}

/* =========================
   LOAD TRANSACTIONS
========================= */
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

  } catch (err) {
    console.error(err);
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
    alert("Please fill all required fields");
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

/* =========================
   EDIT TRANSACTION (FIXED)
========================= */
async function editTransaction(id, oldCategory, oldAmount, type) {
  let newCategory = oldCategory;

  if (type === "expense") {
    newCategory = prompt("Edit category:", oldCategory);
    if (!newCategory) return;
  }

  const newAmount = prompt("Edit amount:", oldAmount);
  if (!newAmount || isNaN(newAmount)) return;

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
   DELETE TRANSACTION (FIXED)
========================= */
async function deleteTransaction(id) {
  const confirmDelete = confirm("Are you sure you want to delete?");
  if (!confirmDelete) return;

  await fetch(`${API}/${id}`, {
    method: "DELETE",
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
   DARK MODE
========================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* =========================
   INIT
========================= */
loadTransactions();
