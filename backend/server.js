const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 5000;

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

/* ---------- DATABASE ---------- */
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

/* ---------- CREATE TABLES ---------- */
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
      type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

/* ---------- TEST ROUTE ---------- */
app.get("/", (req, res) => {
  res.json({ message: "OmniDesk Pro backend running" });
});

/* ---------- TASK ROUTES ---------- */

// Get all tasks
app.get("/api/tasks", (req, res) => {
  db.all(
    "SELECT * FROM tasks ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create task
app.post("/api/tasks", (req, res) => {
  const { title } = req.body;
  if (!title)
    return res.status(400).json({ error: "Title is required" });

  db.run(
    "INSERT INTO tasks (title) VALUES (?)",
    [title],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.run("INSERT INTO activity (type) VALUES (?)", ["task_created"]);

      res.json({
        id: this.lastID,
        title,
        completed: 0,
      });
    }
  );
});

// Complete task
app.put("/api/tasks/:id", (req, res) => {
  db.run(
    "UPDATE tasks SET completed = 1 WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.run("INSERT INTO activity (type) VALUES (?)", ["task_completed"]);
      res.json({ success: true });
    }
  );
});

/* ---------- NOTES ROUTES ---------- */

// Get all notes
app.get("/api/notes", (req, res) => {
  db.all(
    "SELECT * FROM notes ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create note
app.post("/api/notes", (req, res) => {
  const { content } = req.body;
  if (!content)
    return res.status(400).json({ error: "Content is required" });

  db.run(
    "INSERT INTO notes (content) VALUES (?)",
    [content],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.run("INSERT INTO activity (type) VALUES (?)", ["note_created"]);

      res.json({
        id: this.lastID,
        content,
      });
    }
  );
});

/* ---------- STATS ROUTE ---------- */
app.get("/api/stats", (req, res) => {
  const stats = {};

  db.get("SELECT COUNT(*) as total FROM tasks", [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.totalTasks = row.total;

    db.get(
      "SELECT COUNT(*) as completed FROM tasks WHERE completed = 1",
      [],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.completedTasks = row.completed;

        stats.completionRate =
          stats.totalTasks === 0
            ? 0
            : Math.round(
                (stats.completedTasks / stats.totalTasks) * 100
              );

        db.get(
          "SELECT COUNT(*) as notes FROM notes",
          [],
          (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.notesCount = row.notes;

            db.all(
              `
              SELECT DATE(created_at) as date, COUNT(*) as count
              FROM tasks
              GROUP BY DATE(created_at)
              ORDER BY date
              `,
              [],
              (err, rows) => {
                if (err)
                  return res.status(500).json({ error: err.message });

                stats.tasksPerDay = rows;
                res.json(stats);
              }
            );
          }
        );
      }
    );
  });
});

/* ---------- START SERVER ---------- */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
