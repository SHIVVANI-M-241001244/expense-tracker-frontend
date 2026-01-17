const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

// AUTH CHECK
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user._id) {
  alert("Invalid user. Please login again.");
  window.location.href = "login.html";
}

// Greeting
document.getElementById("greeting").innerText =
  `Hi ${user.name} 💜`;

// ADD TRANSACTION
async function addTransaction() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

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
      note,
    }),
  });

  document.getElementById("amount").value = "";
  document.getElementById("note").value = "";
  document.getElementById("category").value = "";

  loadTransactions();
}

// LOAD TRANSACTIONS
async function loadTransactions() {
  const res = await fetch(`${API}/${user._id}`);
  const data = await res.json();

  let income = 0, expense = 0;
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  data.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      ${t.category} - ₹${t.amount}
      <button onclick="deleteTx('${t._id}')">🗑️</button>
    `;
    list.appendChild(li);
  });

  document.getElementById("totalIncome").innerText = `₹${income}`;
  document.getElementById("totalExpense").innerText = `₹${expense}`;
  document.getElementById("balance").innerText = `₹${income - expense}`;

  if (typeof renderCharts === "function") {
    renderCharts(data);
  }
}

// DELETE
async function deleteTx(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

// DARK MODE
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// LOGOUT
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

loadTransactions();
