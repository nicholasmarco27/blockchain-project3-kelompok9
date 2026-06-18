import React from "react";

// Loading Skeleton (Bonus): placeholder berdenyut saat data tugas
// pertama kali dimuat dari blockchain — menggantikan spinner biasa.
function TodoSkeleton({ count = 3 }) {
  return (
    <ul className="todo-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="todo-item skeleton-item">
          <div className="todo-main">
            <span className="skeleton skeleton-line skeleton-title" />
            <div className="todo-meta">
              <span className="skeleton skeleton-pill" />
              <span className="skeleton skeleton-pill" />
            </div>
          </div>
          <div className="todo-actions">
            <span className="skeleton skeleton-btn" />
            <span className="skeleton skeleton-btn" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default TodoSkeleton;
