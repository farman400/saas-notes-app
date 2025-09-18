import { useEffect, useState } from "react";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    if (token) fetchNotes();
  }, []);

  async function fetchNotes() {
    const res = await fetch("/api/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotes(data);
  }

  async function addNote() {
    setError("");
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    if (res.ok) {
      setNotes([data, ...notes]);
      setTitle("");
      setContent("");
    } else {
      setError(data.error);
    }
  }

  async function deleteNote(id) {
    await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes(notes.filter((n) => n.id !== id));
  }

  async function upgradePlan() {
    const res = await fetch(`/api/tenants/acme/upgrade`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert("✅ Tenant upgraded to PRO!");
    }
  }

  return (
    <div className="page-bg">
      <div className="notes-container">
        <h1>Your Notes</h1>

        {error && <p className="error">{error}</p>}

        <div className="form-row">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button onClick={addNote}>Add</button>
        </div>

        <div className="notes-list">
          {notes.map((n) => (
            <div key={n.id} className="note-card">
              <div>
                <h2>{n.title}</h2>
                <p>{n.content}</p>
              </div>
              <button onClick={() => deleteNote(n.id)} className="delete-btn">
                Delete
              </button>
            </div>
          ))}
        </div>

        {user?.role === "ADMIN" && (
          <div className="upgrade-box">
            <button onClick={upgradePlan} className="upgrade-btn">
              🚀 Upgrade to Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
