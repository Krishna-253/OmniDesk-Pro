"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";


export default function ActivityPage() {
  const [activity, setActivity] = useState([]);
  const [filter, setFilter] = useState("all");

  const safeFetch = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url);
    return res.json();
  };

  useEffect(() => {
    safeFetch(`${API_BASE}/api/activity`).then((a) =>
      setActivity(a || [])
    );
  }, []);

  const filteredActivity = activity.filter((a) => {
    if (filter === "all") return true;
    return a.message.toLowerCase().includes(filter);
  });

  return (
    <main>
      <h1>Activity</h1>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: 16 }}
      >
        <option value="all">All</option>
        <option value="created">Created</option>
        <option value="completed">Completed</option>
        <option value="note">Notes</option>
      </select>

      {filteredActivity.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
            No recent activity yet.
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
    </main>
  );
}
