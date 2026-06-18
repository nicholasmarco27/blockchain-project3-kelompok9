import React from "react";

// Filter tampilan tugas: all / active / completed.
function FilterBar({ filter, onChange, counts }) {
  const tabs = [
    { key: "all", label: "Semua" },
    { key: "active", label: "Aktif" },
    { key: "completed", label: "Selesai" },
  ];

  return (
    <div className="filter-bar">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`filter-btn ${filter === t.key ? "active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.label} <span className="filter-count">{counts[t.key]}</span>
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
