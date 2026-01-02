"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function TasksPerDayChart({ tasks }) {
  // Build counts per YYYY-MM-DD (stable sorting)
  const counts = {};

  tasks.forEach((t) => {
    if (!t.created_at) return;
    const d = new Date(t.created_at);
    const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
    counts[key] = (counts[key] || 0) + 1;
  });

  const labels = Object.keys(counts).sort();
  const dataPoints = labels.map((l) => counts[l]);

  // If only ONE point, chart.js draws nothing unless we show points
  const data = {
    labels,
    datasets: [
      {
        label: "Tasks created",
        data: dataPoints,
        borderColor: "#9cdcfe",
        backgroundColor: "rgba(156,220,254,0.3)",
        tension: 0.35,
        pointRadius: 6,          // 👈 IMPORTANT
        pointHoverRadius: 8,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: "var(--muted)" },
        grid: { color: "var(--card-border)" },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "var(--muted)",
          stepSize: 1,
          precision: 0,
        },
        grid: { color: "var(--card-border)" },
      },
    },
  };

  return (
    <div style={{ height: 260 }}>
      <Line data={data} options={options} />
    </div>
  );
}
