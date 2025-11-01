document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("budgetForm");
  const reinvestEl = document.getElementById("reinvestPct");
  const reinvestOut = document.getElementById("reinvestOut");
  const summary = document.getElementById("summary");
  const allocations = document.getElementById("allocations");
  const canvas = document.getElementById("cashflowChart");
  const downloadBtn = document.getElementById("downloadBtn");
  const themeToggle = document.getElementById("themeToggle");

  // Dark mode toggle
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  reinvestEl.addEventListener("input", () => {
    reinvestOut.value = reinvestEl.value + "%";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculate();
  });

  function calculate() {
    const revenue = parseFloat(document.getElementById("revenue").value) || 0;
    const fixed = parseFloat(document.getElementById("fixedCosts").value) || 0;
    const variable = parseFloat(document.getElementById("variableCosts").value) || 0;
    const reinvestPct = parseFloat(reinvestEl.value) / 100;

    const profit = Math.max(0, revenue - fixed - variable);
    const reinvest = profit * reinvestPct;
    const savings = profit - reinvest;

    summary.innerHTML = `
      <h3>Summary</h3>
      <p><strong>Monthly Profit:</strong> €${profit.toFixed(2)}</p>
      <p><strong>Reinvestment:</strong> €${reinvest.toFixed(2)} (${(reinvestPct * 100).toFixed(0)}%)</p>
      <p><strong>Savings:</strong> €${savings.toFixed(2)}</p>
    `;

    const allocs = [
      { name: "R&D", pct: 0.4 },
      { name: "Marketing", pct: 0.35 },
      { name: "Hiring", pct: 0.15 },
      { name: "Tools", pct: 0.1 },
    ];
    allocations.innerHTML = `
      <h3>Suggested Reinvestment Allocation</h3>
      <ul>${allocs
        .map(
          (a) =>
            `<li>${a.name}: €${(reinvest * a.pct).toFixed(2)} (${(a.pct * 100).toFixed(
              0
            )}%)</li>`
        )
        .join("")}</ul>
    `;

    drawChart([profit, reinvest, savings]);
  }

  function drawChart(values) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const labels = ["Profit", "Reinvest", "Savings"];
    const max = Math.max(...values);
    const barWidth = 100;
    labels.forEach((label, i) => {
      const height = (values[i] / max) * (canvas.height - 50);
      const x = 100 + i * (barWidth + 100);
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(x, canvas.height - height - 30, barWidth, height);
      ctx.fillStyle = "#000";
      ctx.fillText(label, x + 20, canvas.height - 10);
      ctx.fillText("€" + values[i].toFixed(0), x + 10, canvas.height - height - 40);
    });
  }

  downloadBtn.addEventListener("click", () => {
    const rows = [
      ["Metric", "Value"],
      ["Revenue", document.getElementById("revenue").value],
      ["Fixed Costs", document.getElementById("fixedCosts").value],
      ["Variable Costs", document.getElementById("variableCosts").value],
      ["Reinvest %", reinvestEl.value],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "budget-summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
});
