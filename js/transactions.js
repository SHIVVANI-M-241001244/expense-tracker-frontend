const user = JSON.parse(localStorage.getItem("user"));
if (!user) location.href = "login.html";

const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

let allTransactions = [];

async function loadTransactions() {
  const res = await fetch(`${API}/${user._id}`);
  allTransactions = await res.json();
  render(allTransactions);
}

function render(data) {
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  data.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.category} – ₹${t.amount}</span>
      <div class="tx-actions">
        <button onclick="editTransaction('${t._id}', ${t.amount})">✏️</button>
        <button onclick="deleteTransaction('${t._id}')">🗑</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function searchTransactions() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allTransactions.filter(t =>
    t.category.toLowerCase().includes(q) ||
    String(t.amount).includes(q)
  );

  render(filtered);
}

function goBack() {
  location.href = "dashboard.html";
}

loadTransactions();
