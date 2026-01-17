/* ================= AUTH ================= */
const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user._id) {
  alert("Please login again");
  window.location.href = "login.html";
}

const USER_ID = user._id;
const API = "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/* ================= GREETING ================= */
function setGreeting() {
  const hour = new Date().getHours();
  let greet = "Hello";
  let sub = "";

  if (hour >= 5 && hour < 12) {
    greet = "Good Morning";
    sub = "Let’s make today financially calm ✨";
  } else if (hour >= 12 && hour < 17) {
    greet = "Good Afternoon";
    sub = "Small steps build strong habits 💛";
  } else if (hour >= 17 && hour < 21) {
    greet = "Good Evening";
    sub = "Every rupee counts 💜";
  } else {
    greet = "Good Night";
    sub = "Track gently, rest peacefully 🤍";
  }

  document.getElementById("greetingText").innerText =
    `${greet}, ${user.name}`;
  document.getElementById("greetingSub").innerText = sub;
}

setGreeting();

/* ================= ADD ================= */
async function addTransaction() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  if (!amount) {
    alert("Amount required");
    return;
  }

  if (type === "expense" && !category) {
    alert("Select category");
    return;
  }

  await fetch(`${API}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: USER_ID,
      type,
      category: type === "income" ? "Income" : category,
      amount: Number(amount),
      note
    })
  });

  document.getElementById("amount").value = "";
  document.getElementById("note").value = "";
  document.getElementById("category").value = "";

  loadTransactions();
}

/* ================= LOAD ================= */
async function loadTransactions() {
  const res = await fetch(`${API}/${USER_ID}`);
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
      <span>${t.category} – ₹${t.amount}</span>
      <div>
        <button onclick="editTx('${t._id}', '${t.category}', ${t.amount})">✏️</button>
        <button onclick="deleteTx('${t._id}')">🗑️</button>
      </div>
    `;
    list.appendChild(li);
  });

  document.getElementById("totalIncome").innerText = `₹${income}`;
  document.getElementById("totalExpense").innerText = `₹${expense}`;
  document.getElementById("balance").innerText = `₹${income - expense}`;
}

/* ================= EDIT ================= */
async function editTx(id, category, amount) {
  const newAmount = prompt("Edit amount", amount);
  if (!newAmount) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category,
      amount: Number(newAmount)
    })
  });

  loadTransactions();
}

/* ================= DELETE ================= */
async function deleteTx(id) {
  if (!confirm("Delete this transaction?")) return;

  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/* ================= DARK MODE ================= */
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ================= INIT ================= */
loadTransactions();
