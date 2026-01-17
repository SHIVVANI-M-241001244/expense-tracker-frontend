const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

// AUTH
const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user.id) {
  alert("Please login again");
  window.location.href = "login.html";
}

document.getElementById("username").innerText = user.name;

// ADD TRANSACTION
async function addTransaction() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  if (!amount) {
    alert("Amount is required");
    return;
  }

  if (type === "expense" && !category) {
    alert("Select a category");
    return;
  }

  const payload = {
    userId: user.id,
    type,
    category: type === "income" ? "Income" : category,
    amount: Number(amount),
    note,
  };

  console.log("SENDING:", payload);

  const res = await fetch(`${API}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log("RESPONSE:", data);

  if (!res.ok) {
    alert("Failed to save");
    return;
  }

  document.getElementById("amount").value = "";
  document.getElementById("note").value = "";
  document.getElementById("category").value = "";

  loadTransactions();
}

// LOAD
async function loadTransactions() {
  const res = await fetch(`${API}/${user.id}`);
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
  localStorage.clear();
  window.location.href = "login.html";
}

loadTransactions();
