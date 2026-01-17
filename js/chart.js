let pieChart, barChart;

function loadCharts(transactions = []) {
  const expenseMap = {};
  let income = 0, expense = 0;

  transactions.forEach(t => {
    if (t.type === "expense") {
      expense += t.amount;
      expenseMap[t.category] =
        (expenseMap[t.category] || 0) + t.amount;
    } else {
      income += t.amount;
    }
  });

  /* ========= PIE CHART ========= */
  const pieCtx = document.getElementById("pieChart");
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieCtx, {
    type: "doughnut",
    data: {
      labels: Object.keys(expenseMap),
      datasets: [{
        data: Object.values(expenseMap),
        backgroundColor: [
          "#f472b6",
          "#a78bfa",
          "#34d399",
          "#60a5fa",
          "#fb7185",
          "#facc15"
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive:false,
      maintainAspectRatio:false,
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth:10,
            padding: 12,
            usePointStyle: true
          }
        }
      }
    }
  });

  /* ========= BAR CHART ========= */
  const barCtx = document.getElementById("barChart");
  if (barChart) barChart.destroy();

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#34d399", "#f87171"],
        borderRadius: 12
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      }
    }
  });
}
