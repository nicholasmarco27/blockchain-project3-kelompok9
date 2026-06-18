import React, { useState } from "react";

// Form untuk menambah tugas baru (write operation: addTodo).
function TodoForm({ onAdd, loading }) {
  const [content, setContent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState(0); // 0=LOW, 1=MEDIUM, 2=HIGH

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi input di frontend
    if (!content.trim()) return;

    const ok = await onAdd(content.trim(), deadline, priority);
    if (ok) {
      setContent("");
      setDeadline("");
      setPriority(0);
    }
  };

  return (
    <form className="card todo-form" onSubmit={handleSubmit}>
      <h3>Tambah Tugas Baru</h3>

      <input
        type="text"
        className="input"
        placeholder="Tulis aktivitas tugas..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        maxLength={200}
        required
      />

      <div className="field-row">
        <label className="field">
          <span className="field-label">Deadline (opsional)</span>
          <input
            type="datetime-local"
            className="input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={loading}
          />
        </label>

        <label className="field">
          <span className="field-label">Prioritas</span>
          <select
            className="input"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            disabled={loading}
          >
            <option value={0}>LOW</option>
            <option value={1}>MEDIUM</option>
            <option value={2}>HIGH</option>
          </select>
        </label>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={loading || !content.trim()}>
        {loading ? "Memproses..." : "Simpan ke Blockchain"}
      </button>
    </form>
  );
}

export default TodoForm;
