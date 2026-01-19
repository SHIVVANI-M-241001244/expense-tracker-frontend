console.log("TRANSACTIONS PAGE LOADED");

const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("Login again");
  location.href = "login.html";
}

const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

let allTransactions = [];

/* LOAD TRANSACTIONS */
async function loadTransactions() {
  try {
    const res = await fetch(`${API}/${user._id}`);
    allTransactions = await res.json();
    render(allTransactions);
  } catch (err) {
    console.error(err);
    alert("Failed to load transactions");
  }
}

/* RENDER */
function render(data) {
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML = "<p class='empty'>No transactions found</p>";
    return;
  }

  data.forEach(t => {
    const li = document.createElement("li");
    li.className = `tx-card ${t.type}`;

    li.innerHTML = `
      <div class="tx-left">
        <span class="tx-type">
          ${t.type === "income" ? "💰 Income" : "💸 Expense"}
        </span>
        <span class="tx-category">${t.category}</span>
      </div>

      <div class="tx-right">
        <span class="tx-amount">
          ${t.type === "income" ? "+" : "-"} ₹${t.amount}
        </span>
        <div class="tx-actions">
          <button onclick="editTransaction('${t._id}', ${t.amount})">✏️</button>
          <button onclick="deleteTransaction('${t._id}')">🗑</button>
        </div>
      </div>
    `;

    list.appendChild(li);
  });
}

/* SEARCH */
function searchTransactions() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allTransactions.filter(t =>
    t.category.toLowerCase().includes(q) ||
    String(t.amount).includes(q) ||
    t.type.toLowerCase().includes(q)
  );

  render(filtered);
}

/* NAVIGATION */
function goBack() {
  location.href = "dashboard.html";
}

/* EDIT */
async function editTransaction(id, oldAmount) {
  const val = prompt("New amount", oldAmount);
  if (!val) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Number(val) })
  });

  loadTransactions();
}

/* DELETE */
async function deleteTransaction(id) {
  if (!confirm("Delete transaction?")) return;

  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

loadTransactions();
