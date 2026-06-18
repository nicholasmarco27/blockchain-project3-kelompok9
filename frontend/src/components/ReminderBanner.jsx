import React from "react";

// Pengingat deadline: tugas yang sudah terlewat atau akan jatuh tempo < 24 jam.
function ReminderBanner({ overdue, soon }) {
  if (!overdue && !soon) return null;

  return (
    <div className="reminder-banner">
      🔔
      {overdue > 0 && (
        <span> <strong>{overdue}</strong> tugas melewati deadline.</span>
      )}
      {soon > 0 && (
        <span> <strong>{soon}</strong> tugas jatuh tempo dalam 24 jam ke depan.</span>
      )}
    </div>
  );
}

export default ReminderBanner;
