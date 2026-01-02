const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database");
});

/* ---------- TABLES ---------- */
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

/* ---------- ROOT ---------- */
app.get("/", (req, res) => {
  res.json({ message: "OmniDesk Pro backend running" });
});

/* ---------- TASKS ---------- */
app.get("/api/tasks", (req, res) => {
  db.all("SELECT * FROM tasks ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/tasks", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });

  db.run("INSERT INTO tasks (title) VALUES (?)", [title], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    db.run("INSERT INTO activity (message) VALUES (?)", [
      `Task created: "${title}"`,
    ]);

    res.json({ id: this.lastID, title, completed: 0 });
  });
});

app.put("/api/tasks/:id", (req, res) => {
  db.get("SELECT title FROM tasks WHERE id = ?", [req.params.id], (err, row) => {
    if (!row) return res.json({ success: false });

    db.run(
      "UPDATE tasks SET completed = 1 WHERE id = ?",
      [req.params.id],
      () => {
        db.run("INSERT INTO activity (message) VALUES (?)", [
          `Task completed: "${row.title}"`,
        ]);
        res.json({ success: true });
      }
    );
  });
});

/* ---------- NOTES ---------- */
app.get("/api/notes", (req, res) => {
  db.all("SELECT * FROM notes ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/notes", (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Content required" });

  db.run("INSERT INTO notes (content) VALUES (?)", [content], function () {
    db.run("INSERT INTO activity (message) VALUES (?)", [
      "Note created",
    ]);
    res.json({ success: true });
  });
});

/* ---------- STATS ---------- */
app.get("/api/stats", (req, res) => {
  const stats = {};

  db.get("SELECT COUNT(*) total FROM tasks", [], (_, r1) => {
    stats.totalTasks = r1.total;

    db.get(
      "SELECT COUNT(*) completed FROM tasks WHERE completed = 1",
      [],
      (_, r2) => {
        stats.completedTasks = r2.completed;
        stats.completionRate =
          stats.totalTasks === 0
            ? 0
            : Math.round((r2.completed / stats.totalTasks) * 100);

        db.get("SELECT COUNT(*) notes FROM notes", [], (_, r3) => {
          stats.notesCount = r3.notes;
          res.json(stats);
        });
      }
    );
  });
});

/* ---------- ACTIVITY ---------- */
app.get("/api/activity", (req, res) => {
  db.all(
    "SELECT * FROM activity ORDER BY created_at DESC LIMIT 10",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/* ---------- START ---------- */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
