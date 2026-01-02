"use client";

import { useEffect, useState } from "react";
import TasksPerDayChart from "../components/TasksPerDayChart";

const API_BASE = "http://localhost:5000";

export default function Home() {
  /* ===================== STATE ===================== */
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);

  const [newTask, setNewTask] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | completed | pending
  const [activityFilter, setActivityFilter] = useState("all"); // all | created | completed | note

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ===================== FETCH HELPERS ===================== */
  const safeFetch = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url);
    return res.json();
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [t, s, a] = await Promise.all([
        safeFetch(`${API_BASE}/api/tasks`),
        safeFetch(`${API_BASE}/api/stats`),
        safeFetch(`${API_BASE}/api/activity`),
      ]);

      setTasks(t || []);
      setStats(s || null);
      setActivity(a || []);
    } catch (err) {
      console.error(err);
      setError("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ===================== ACTIONS ===================== */
  const addTask = async () => {
    if (!newTask.trim()) return;

    await fetch(`${API_BASE}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask }),
    });

    setNewTask("");
    fetchAll();
  };

  const completeTask = async (id) => {
    await fetch(`${API_BASE}/api/tasks/${id}`, { method: "PUT" });
    fetchAll();
  };

  /* ===================== DERIVED STATE ===================== */

  // Task search + filter
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && t.completed) ||
      (filter === "pending" && !t.completed);

    return matchesSearch && matchesFilter;
  });

  // Activity filter 👈 THIS IS WHAT YOU ASKED ABOUT
  const filteredActivity = activity.filter((a) => {
    if (activityFilter === "all") return true;
    return a.message.toLowerCase().includes(activityFilter);
  });

  /* ===================== UI ===================== */
  return (
    <main>
      <h1>Dashboard</h1>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && stats && (
        <>
          {/* ===================== STATS ===================== */}
          <section style={{ marginTop: 20 }}>
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
          <section style={{ marginTop: 40 }}>
            <h2>Tasks per day</h2>
            <div
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <TasksPerDayChart tasks={tasks} />
            </div>
          </section>

          {/* ===================== ADD TASK ===================== */}
          <section style={{ marginTop: 40 }}>
            <h2>Add Task</h2>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Task title"
            />
            <button onClick={addTask}>Add</button>
          </section>

          {/* ===================== TASK FILTERS ===================== */}
          <section style={{ marginTop: 40 }}>
            <h2>Tasks</h2>

            <div
              style={{
                marginBottom: 16,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {filteredTasks.length === 0 && (
              <p style={{ color: "var(--muted)" }}>
                No tasks match your search/filter.
              </p>
            )}

            <ul>
              {filteredTasks.map((t) => (
                <li key={t.id}>
                  <span
                    style={{
                      textDecoration: t.completed
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {t.title}
                  </span>

                  {!t.completed && (
                    <button onClick={() => completeTask(t.id)}>
                      Done
                    </button>
                  )}

                  {t.completed && " ✅"}
                </li>
              ))}
            </ul>
          </section>

          {/* ===================== ACTIVITY ===================== */}
          <section style={{ marginTop: 40 }}>
            <h2>Recent Activity</h2>

            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              style={{ marginBottom: 12 }}
            >
              <option value="all">All activity</option>
              <option value="created">Created</option>
              <option value="completed">Completed</option>
              <option value="note">Notes</option>
            </select>

            {filteredActivity.length === 0 && (
              <p style={{ color: "var(--muted)" }}>
                No activity for this filter.
              </p>
            )}

            <ul>
              {filteredActivity.map((a) => (
                <li key={a.id}>
                  {a.message}{" "}
                  <small style={{ color: "var(--muted)" }}>
                    ({new Date(a.created_at).toLocaleString()})
                  </small>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}

/* ===================== CARD ===================== */
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
