let pieChart, barChart, lineChart;

async function loadCharts() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user._id || user.id;

  const res = await fetch(
    `https://shivvani-m-expense-backend.onrender.com/api/transactions/${userId}`
  );
  const data = await res.json();

  const expenseMap = {};
  let income = 0,
    expense = 0,
    balance = 0;
  const balanceData = [];

  data.forEach((t) => {
    if (t.type === "expense") {
      expense += t.amount;
      expenseMap[t.category] =
        (expenseMap[t.category] || 0) + t.amount;
    } else {
      income += t.amount;
    }
    balance += t.type === "income" ? t.amount : -t.amount;
    balanceData.push(balance);
  });

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieChartEl, {
    type: "pie",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{ data: Object.values(expenseMap) }],
    },
  });

  if (barChart) barChart.destroy();
  barChart = new Chart(barChartEl, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{ data: [income, expense] }],
    },
  });

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(lineChartEl, {
    type: "line",
    data: {
      labels: balanceData.map((_, i) => i + 1),
      datasets: [{ data: balanceData }],
    },
  });
}
