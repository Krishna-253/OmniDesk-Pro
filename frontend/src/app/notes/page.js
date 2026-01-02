"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  const fetchNotes = async () => {
    const res = await fetch("http://localhost:5000/api/notes");
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async () => {
    if (!newNote.trim()) return;

    await fetch("http://localhost:5000/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote }),
    });

    setNewNote("");
    fetchNotes();
  };

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>

      <h1>Notes</h1>

      <section style={{ marginTop: "20px" }}>
        <textarea
          placeholder="Write a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: "10px" }}
        />
        <button onClick={addNote} style={{ marginTop: "10px" }}>
          Add Note
        </button>
      </section>

      <section style={{ marginTop: "30px" }}>
        <h2>Saved Notes</h2>

        {notes.length === 0 && <p>No notes yet.</p>}

        <ul>
          {notes.map((note) => (
            <li key={note.id} style={{ marginBottom: "10px" }}>
              {note.content}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
