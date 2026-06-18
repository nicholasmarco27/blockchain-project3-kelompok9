import React, { useState } from "react";
import TodoItem from "./TodoItem";

// Menampilkan daftar tugas (read: getTodos) + drag-and-drop reorder.
function TodoList({ todos, onComplete, onDelete, onShare, loading, onReorder, reorderable }) {
  const [draggedId, setDraggedId] = useState(null);

  const handleDrop = (targetId) => {
    if (draggedId !== null) onReorder(draggedId, targetId);
    setDraggedId(null);
  };

  if (todos.length === 0) {
    return <p className="empty-state">Tidak ada tugas pada filter ini.</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={Number(todo.id)}
          todo={todo}
          onComplete={onComplete}
          onDelete={onDelete}
          onShare={onShare}
          loading={loading}
          draggable={reorderable}
          dragging={draggedId === Number(todo.id)}
          onDragStart={setDraggedId}
          onDrop={handleDrop}
          onDragEnd={() => setDraggedId(null)}
        />
      ))}
    </ul>
  );
}

export default TodoList;
