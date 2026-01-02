"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";


export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const safeFetch = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url);
    return res.json();
  };

  const fetchTasks = async () => {
    const data = await safeFetch(`${API_BASE}/api/tasks`);
    setTasks(data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;

    await fetch(`${API_BASE}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask }),
    });

    setNewTask("");
    fetchTasks();
  };

  const completeTask = async (id) => {
    await fetch(`${API_BASE}/api/tasks/${id}`, { method: "PUT" });
    fetchTasks();
  };

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

  return (
    <main>
      <h1>Tasks</h1>

      {/* ADD TASK */}
      <section style={{ marginTop: 20 }}>
        <input
          placeholder="Task title"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </section>

      {/* FILTERS */}
      <section style={{ marginTop: 20 }}>
        <input
          placeholder="Search…"
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
      </section>

      {/* TASK LIST */}
      <section style={{ marginTop: 20 }}>
            {filteredTasks.length === 0 && (
                <p style={{ color: "var(--muted)" }}>
                    No tasks found. Try changing filters or add a new task.
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
    </main>
  );
}
