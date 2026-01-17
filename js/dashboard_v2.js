/*******************************
  DARK MODE
********************************/
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

/*******************************
  AUTH
********************************/
const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user.id) {
  alert("Please login again");
  window.location.href = "login.html";
}

/*******************************
  GREETING
********************************/
function setGreeting() {
  const hour = new Date().getHours();
  let greet = "Hello";
  let sub = "";
  let emoji = "";

  if (hour >= 5 && hour < 12) {
    greet = "Good Morning";
    emoji = "☀️";
    sub = "Let’s make today financially calm ✨";
  } else if (hour >= 12 && hour < 17) {
    greet = "Good Afternoon";
    emoji = "🌤️";
    sub = "Small steps build strong habits 💛";
  } else if (hour >= 17 && hour < 21) {
    greet = "Good Evening";
    emoji = "🌆";
    sub = "Every rupee counts 💜";
  } else {
    greet = "Good Night";
    emoji = "🌙";
    sub = "Track gently, rest peacefully 🤍";
  }

  document.getElementById("greetingText").innerText =
    `${greet}, ${user.name} ${emoji}`;
  document.getElementById("greetingSub").innerText = sub;
}

setGreeting();

/*******************************
  API
********************************/
const API =
  "https://shivvani-m-expense-backend.onrender.com/api/transactions";

/*******************************
  ADD TRANSACTION
********************************/
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

  await fetch(`${API}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.id,
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

/*******************************
  LOAD TRANSACTIONS
********************************/
async function loadTransactions() {
  const res = await fetch(`${API}/${user.id}`);
  const data = await res.json();

  let income = 0;
  let expense = 0;

  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  data.forEach((t) => {
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

  if (typeof renderCharts === "function") {
    renderCharts(data);
  }
}

/*******************************
  EDIT TRANSACTION
********************************/
async function editTx(id, oldCategory, oldAmount) {
  const newAmount = prompt("Edit amount:", oldAmount);
  if (!newAmount) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: oldCategory,
      amount: Number(newAmount),
    }),
  });

  loadTransactions();
}

/*******************************
  DELETE TRANSACTION
********************************/
async function deleteTx(id) {
  if (!confirm("Delete this transaction?")) return;

  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadTransactions();
}

/*******************************
  LOGOUT
********************************/
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/*******************************
  INIT
********************************/
loadTransactions();
