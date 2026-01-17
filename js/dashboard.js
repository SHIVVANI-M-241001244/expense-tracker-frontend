document.addEventListener("DOMContentLoaded", () => {
  const API_URL =
    "https://shivvani-m-expense-backend.onrender.com/api/transactions";

  const userRaw = JSON.parse(localStorage.getItem("user"));
  if (!userRaw) {
    window.location.href = "login.html";
    return;
  }

  const user = {
    ...userRaw,
    id: userRaw._id || userRaw.id,
  };

  document.getElementById("username").innerText = user.name || "User";

  /* DARK MODE */
  window.toggleDarkMode = () => {
    document.body.classList.toggle("dark");
  };

  /* ADD TRANSACTION */
  window.addTransaction = async () => {
    const type = typeEl.value;
    const category =
      type === "income" ? "Income" : categoryEl.value;
    const amount = amountEl.value;
    const note = noteEl.value;

    if (!amount || (type === "expense" && !category)) {
      alert("Fill all required fields");
      return;
    }

    await fetch(`${API_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        type,
        category,
        amount: Number(amount),
        note,
      }),
    });

    amountEl.value = "";
    noteEl.value = "";

    loadTransactions();
    loadCharts();
  };

  /* LOAD TRANSACTIONS */
  async function loadTransactions() {
    const res = await fetch(`${API_URL}/${user.id}`);
    const data = await res.json();

    let income = 0,
      expense = 0;
    transactionList.innerHTML = "";

    data.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${t.category}</span>
        <span class="${t.type}">
          ${t.type === "income" ? "+" : "-"}₹${t.amount}
        </span>
        <button onclick="editTransaction('${t._id}', '${t.category}', ${t.amount}, '${t.type}')">✏️</button>
        <button onclick="deleteTransaction('${t._id}')">🗑️</button>
      `;
      transactionList.appendChild(li);
    });

    totalIncome.innerText = `₹${income}`;
    totalExpense.innerText = `₹${expense}`;
    balance.innerText = `₹${income - expense}`;
  }

  /* DELETE */
  window.deleteTransaction = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadTransactions();
    loadCharts();
  };

  /* EDIT */
  window.editTransaction = async (id, category, amount, type) => {
    const newAmount = prompt("Edit amount:", amount);
    if (!newAmount) return;

    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        amount: Number(newAmount),
        type,
      }),
    });

    loadTransactions();
    loadCharts();
  };

  window.logout = () => {
    localStorage.clear();
    window.location.href = "login.html";
  };

  loadTransactions();
});
