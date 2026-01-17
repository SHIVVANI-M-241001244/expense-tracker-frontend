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
   API URL
========================= */
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/* =========================
   GREETING
========================= */
const greetingEl = document.getElementById("greeting");
if (greetingEl) {
  greetingEl.innerText = `Hi ${user.name} 💜`;
}

/* =========================
   FETCH TRANSACTIONS
========================= */
async function fetchTransactions() {
  try {
    const res = await fetch(`${API}/user/${user._id}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch");
    }

    renderTransactions(data);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch transactions");
  }
}

/* =========================
   RENDER TRANSACTIONS
========================= */
function renderTransactions(transactions) {
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  if (transactions.length === 0) {
    list.innerHTML = "<p>No transactions yet</p>";
    return;
  }

  transactions.forEach((t) => {
    const div = document.createElement("div");
    div.className = "transaction";

    div.innerHTML = `
      <span>${t.category || "Income"} - ₹${t.amount}</span>
      <span>${t.type}</span>
      <button onclick="deleteTransaction('${t._id}')">🗑</button>
    `;

    list.appendChild(div);
  });
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
    const res = await fetch(`${API}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        type,
        category,
        amount,
        note,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Add failed");
    }

    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";

    fetchTransactions();
  } catch (err) {
    console.error(err);
    alert("Failed to add transaction");
  }
}

/* =========================
   DELETE TRANSACTION
========================= */
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Delete failed");
    }

    fetchTransactions();
  } catch (err) {
    console.error(err);
    alert("Failed to delete transaction");
  }
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

/* =========================
   INIT
========================= */
fetchTransactions();
