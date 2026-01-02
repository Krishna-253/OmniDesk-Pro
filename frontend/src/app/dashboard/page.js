"use client";

import { useEffect, useState } from "react";
import TasksPerDayChart from "../../components/TasksPerDayChart";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";


export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const safeFetch = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url);
    return res.json();
  };

  useEffect(() => {
    Promise.all([
      safeFetch(`${API_BASE}/api/tasks`),
      safeFetch(`${API_BASE}/api/stats`),
    ])
      .then(([t, s]) => {
        setTasks(t || []);
        setStats(s || null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard…</p>;
  if (!stats) return <p>Failed to load dashboard.</p>;

  return (
    <main>
      <h1>Dashboard</h1>

      {/* ===================== STATS ===================== */}
      <section style={{ marginTop: 32 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
            gap: 16,
          }}
        >
          <Card label="Total Tasks" value={stats.totalTasks} />
          <Card label="Completed" value={stats.completedTasks} />
          <Card
            label="Completion Rate"
            value={`${stats.completionRate}%`}
          />
          <Card label="Notes" value={stats.notesCount} />
        </div>
      </section>

      {/* ===================== CHART ===================== */}
      <section style={{ marginTop: 32 }}>
        <h2>Tasks per day</h2>

        <div
          style={{
            marginTop: 16,
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <TasksPerDayChart tasks={tasks} />
        </div>
      </section>
    </main>
  );
}

function Card({ label, value }) {
  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <p style={{ color: "var(--muted)", fontSize: 14 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: "bold" }}>{value}</p>
    </div>
  );
}
