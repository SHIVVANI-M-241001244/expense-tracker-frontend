if (!document.getElementById("pieChart")) {
  // Not on dashboard page → stop executing
  return;
}
let pieChart, barChart, lineChart;

async function loadCharts() {
  const user = JSON.parse(localStorage.getItem("user"));
  const res = await fetch(`https://shivvani-m-expense-backend.onrender.com/api/transactions/${user.id}`);
  const transactions = await res.json();

  let income = 0;
  let expense = 0;
  let categories = {};
  let balance = 0;
  let balanceData = [];

  transactions.reverse().forEach((t) => {
    if (t.type === "income") {
      income += t.amount;
      balance += t.amount;
    } else {
      expense += t.amount;
      balance -= t.amount;

      categories[t.category] =
        (categories[t.category] || 0) + t.amount;
    }
    balanceData.push(balance);
  });

  // PIE CHART (Expense Categories)
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
        },
      ],
    },
  });

  // BAR CHART (Income vs Expense)
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          data: [income, expense],
        },
      ],
    },
  });

  // LINE CHART (Balance Trend)
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: balanceData.map((_, i) => i + 1),
      datasets: [
        {
          data: balanceData,
          fill: false,
        },
      ],
    },
  });
}

loadCharts();
