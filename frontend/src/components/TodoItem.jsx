import React from "react";
import {
  getPriorityText,
  getPriorityClass,
  formatDeadline,
  formatAddress,
  isShared,
  getDeadlineStatus,
} from "../utils/helpers";

// Satu baris tugas: bisa di-drag untuk reorder, menampilkan reminder deadline,
// dan aksi complete / delete / share.
function TodoItem({
  todo,
  onComplete,
  onDelete,
  onShare,
  loading,
  draggable,
  dragging,
  onDragStart,
  onDrop,
  onDragEnd,
}) {
  const id = Number(todo.id);
  const deadline = formatDeadline(todo.deadline);
  const shared = isShared(todo.sharedBy);
  const dStatus = getDeadlineStatus(todo);

  return (
    <li
      className={`todo-item ${todo.completed ? "is-completed" : ""} ${dragging ? "dragging" : ""}`}
      draggable={draggable}
      onDragStart={() => onDragStart(id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(id)}
      onDragEnd={onDragEnd}
    >
      {draggable && (
        <span className="drag-handle" title="Tahan & seret untuk mengurutkan">
          ⠿
        </span>
      )}

      <div className="todo-main">
        <span className="todo-content">{todo.content}</span>
        <div className="todo-meta">
          <span className={`priority-badge ${getPriorityClass(todo.priority)}`}>
            {getPriorityText(todo.priority)}
          </span>
          {deadline && <span className="todo-deadline">🕒 {deadline}</span>}
          {dStatus === "overdue" && (
            <span className="deadline-badge overdue">⚠️ Terlewat</span>
          )}
          {dStatus === "soon" && (
            <span className="deadline-badge soon">⏰ Segera</span>
          )}
          {shared && (
            <span className="todo-shared">
              dibagikan oleh {formatAddress(todo.sharedBy)}
            </span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        {!todo.completed && (
          <button className="btn btn-success btn-sm" onClick={() => onComplete(id)} disabled={loading}>
            Selesai
          </button>
        )}
        <button className="btn btn-secondary btn-sm" onClick={() => onShare(id)} disabled={loading}>
          Bagikan
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(id)} disabled={loading}>
          Hapus
        </button>
      </div>
    </li>
  );
}

export default TodoItem;
