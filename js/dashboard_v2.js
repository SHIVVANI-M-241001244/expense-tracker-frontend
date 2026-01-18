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
const greet = document.getElementById("greetingText");
if (greet) {
  const hour = new Date().getHours();
  const wish =
    hour < 12 ? "Good Morning" :
    hour < 17 ? "Good Afternoon" :
    "Good Evening";

  greet.innerText = `${wish}, ${user.name} 💜`;
}

/* =========================
   LOAD TRANSACTIONS
========================= */
async function loadTransactions() {
  try {
    const res = await fetch(`${API}/${user._id}`);
    const data = await res.json();

    let income = 0;
    let expense = 0;

    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    data.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      const li = document.createElement("li");
      li.innerHTML = `
        ${t.category} - ₹${t.amount}
        <button onclick="deleteTransaction('${t._id}')">🗑</button>
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

  if (!amount || (type === "expense" && !category)) {
    alert("Fill all fields");
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
    }),
  });

  loadTransactions();
}

/* =========================
   DELETE
========================= */
async function deleteTransaction(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

loadTransactions();
