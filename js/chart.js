let pieChart, barChart, lineChart;

function loadCharts() {
  fetch(
    `https://shivvani-m-expense-backend.onrender.com/api/transactions/${JSON.parse(localStorage.getItem("user")).id}`
  )
    .then(res => res.json())
    .then(data => {
      const expenseData = {};
      let income = 0;
      let expense = 0;
      let balance = [];

      data.forEach(t => {
        if (t.type === "expense") {
          expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
          expense += t.amount;
        } else {
          income += t.amount;
        }
        balance.push(income - expense);
      });

      if (pieChart) pieChart.destroy();
      pieChart = new Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: {
          labels: Object.keys(expenseData),
          datasets: [{
            data: Object.values(expenseData),
            backgroundColor: ["#ff7675", "#74b9ff", "#55efc4", "#ffeaa7"]
          }]
        }
      });

      if (barChart) barChart.destroy();
      barChart = new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
          labels: ["Income", "Expense"],
          datasets: [{
            data: [income, expense],
            backgroundColor: ["#00cec9", "#ff7675"]
          }]
        }
      });

      if (lineChart) lineChart.destroy();
      lineChart = new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
          labels: balance.map((_, i) => i + 1),
          datasets: [{
            data: balance,
            borderColor: "#6c5ce7",
            fill: false
          }]
        }
      });
    });
}

loadCharts();
