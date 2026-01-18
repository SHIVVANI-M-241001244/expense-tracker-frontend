let pieChart, barChart, lineChart;

function renderCharts(transactions, income, expense) {
  /* =========================
     PIE CHART – EXPENSES ONLY
  ========================= */
  const expenseMap = {};

  transactions.forEach((t) => {
    if (t.type === "expense") {
      expenseMap[t.category] =
        (expenseMap[t.category] || 0) + t.amount;
    }
  });

  const pieCtx = document.getElementById("pieChart").getContext("2d");
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieCtx, {
  type: "pie",
  data: {
    labels,
    datasets: [{
      data,
      backgroundColor: [
        "#f8b4b4",
        "#fcd5ce",
        "#fae1dd",
        "#cdb4db",
        "#bde0fe",
        "#a2d2ff"
      ],
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 15
        }
      }
    }
  }
});

  /* =========================
     BAR CHART – INCOME / EXPENSE / SAVINGS
  ========================= */
  const savings = income - expense;

  const barCtx = document.getElementById("barChart").getContext("2d");
  if (barChart) barChart.destroy();

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["Income", "Expense", "Savings"],
      datasets: [
        {
          data: [income, expense, savings],
          backgroundColor: ["#bde0fe", "#ffc8dd", "#cdb4db"],
        },
      ],
    },
  });

  /* =========================
     LINE CHART – BALANCE TREND
  ========================= */
  let runningBalance = 0;
  const trend = [];

  transactions.forEach((t) => {
    runningBalance += t.type === "income" ? t.amount : -t.amount;
    trend.push(runningBalance);
  });

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  if (lineChart) lineChart.destroy();

  lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: trend.map((_, i) => i + 1),
      datasets: [
        {
          label: "Balance Trend",
          data: trend,
          borderColor: "#8b5cf6",
          fill: false,
          tension: 0.4,
        },
      ],
    },
  });
}
