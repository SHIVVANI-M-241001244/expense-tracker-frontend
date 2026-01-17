let pieChart = null;
let barChart = null;

function renderCharts(transactions) {
  let income = 0;
  let expense = 0;
  const categories = {};

  transactions.forEach((t) => {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
      categories[t.category] =
        (categories[t.category] || 0) + t.amount;
    }
  });

  // Pie chart
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          "#ff7675","#74b9ff","#55efc4",
          "#ffeaa7","#a29bfe","#fd79a8"
        ]
      }]
    }
  });

  // Bar chart
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#00cec9", "#ff7675"]
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}
