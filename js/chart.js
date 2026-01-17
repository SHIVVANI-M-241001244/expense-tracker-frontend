let pieChart, barChart;

async function loadCharts() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user._id || user.id;

  const res = await fetch(
    `https://shivvani-m-expense-backend.onrender.com/api/transactions/${userId}`
  );
  const data = await res.json();

  let income = 0;
  let expense = 0;
  const categoryMap = {};

  data.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else {
      expense += t.amount;
      categoryMap[t.category] =
        (categoryMap[t.category] || 0) + t.amount;
    }
  });

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieChartEl, {
    type: "pie",
    data: {
      labels: Object.keys(categoryMap),
      datasets: [{ data: Object.values(categoryMap) }],
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
}
