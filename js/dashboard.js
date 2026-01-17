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
    localStorage.setItem(
      "darkMode",
      document.body.classList.contains("dark")
    );
  };

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

  /* BUDGET */
  window.saveBudget = () => {
    const b = document.getElementById("budgetInput").value;
    if (!b) return alert("Enter budget");
    localStorage.setItem("budget", b);
  };

  function checkBudget(exp) {
    const b = localStorage.getItem("budget");
    if (!b) return;
    document.getElementById("budgetStatus").innerText =
      exp > b ? "⚠️ Budget exceeded" : "✅ Within budget";
  }

  /* ADD TRANSACTION */
  window.addTransaction = async () => {
    const type = typeEl.value;
    const category = categoryEl.value;
    const amount = amountEl.value;
    const note = noteEl.value;

    if (!amount || (type === "expense" && !category)) {
      alert("Fill required fields");
      return;
    }

    await fetch(`${API_URL}/add`, {
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
    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    data.forEach((t) => {
      t.type === "income"
        ? (income += t.amount)
        : (expense += t.amount);

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${t.category}</span>
        <span class="${t.type}">
          ${t.type === "income" ? "+" : "-"}₹${t.amount}
        </span>`;
      list.appendChild(li);
    });

    totalIncome.innerText = `₹${income}`;
    totalExpense.innerText = `₹${expense}`;
    balance.innerText = `₹${income - expense}`;
    checkBudget(expense);
  }

  window.logout = () => {
    localStorage.clear();
    window.location.href = "login.html";
  };

  loadTransactions();
});
