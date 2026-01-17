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

  /* =========================
     DARK MODE
  ========================= */
  window.toggleDarkMode = function () {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "darkMode",
      document.body.classList.contains("dark")
    );
  };

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

  /* =========================
     ADD TRANSACTION
  ========================= */
  window.addTransaction = async function () {
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const note = document.getElementById("note").value;

    if (!category || !amount) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/add`, {
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

      if (!res.ok) throw new Error("Save failed");

      document.getElementById("amount").value = "";
      document.getElementById("note").value = "";

      loadTransactions();
    } catch (err) {
      console.error(err);
      alert("❌ Transaction not saved");
    }
  };

  /* =========================
     LOAD TRANSACTIONS
  ========================= */
  async function loadTransactions() {
    const res = await fetch(`${API_URL}/${user.id}`);
    const transactions = await res.json();

    let income = 0;
    let expense = 0;

    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    transactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${t.category}</span>
        <span class="${t.type}">
          ${t.type === "income" ? "+" : "-"}₹${t.amount}
        </span>
      `;
      list.appendChild(li);
    });

    document.getElementById("totalIncome").innerText = `₹${income}`;
    document.getElementById("totalExpense").innerText = `₹${expense}`;
    document.getElementById("balance").innerText = `₹${income - expense}`;
  }

  /* =========================
     LOGOUT
  ========================= */
  window.logout = function () {
    localStorage.clear();
    window.location.href = "login.html";
  };

  loadTransactions();
});
