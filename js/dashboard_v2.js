console.log("DASHBOARD JS LOADED");

/* =========================
   AUTH CHECK
========================= */
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user._id) {
  alert("Invalid user. Please login again.");
  localStorage.clear();
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
if (greetingText && user?.name) {
  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "Good Morning" :
    hour < 17 ? "Good Afternoon" :
    "Good Evening";

  greetingText.innerText = `${greet}, ${user.name} 💜`;
}

/* =========================
   LOAD TRANSACTIONS
========================= */
async function loadTransactions() {
  try {
    const res = await fetch(`${API}/${user._id}`);
    const data = await res.json();

    // ✅ SAFETY CHECK
    const transactions = Array.isArray(data) ? data : [];

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

  try {
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
  } catch (err) {
    alert("Failed to add transaction");
  }
}

/* =========================
   EDIT TRANSACTION
========================= */
async function editTransaction(id, oldCategory, oldAmount, type) {
  const newCategory =
    type === "income" ? "Income" : prompt("Edit category:", oldCategory);
  const newAmount = prompt("Edit amount:", oldAmount);

  if (!newAmount || (type === "expense" && !newCategory)) return;

  try {
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
  } catch (err) {
    alert("Update failed");
  }
}

/* =========================
   DELETE TRANSACTION
========================= */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  try {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    loadTransactions();
  } catch (err) {
    alert("Delete failed");
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
   INIT
========================= */
loadTransactions();
