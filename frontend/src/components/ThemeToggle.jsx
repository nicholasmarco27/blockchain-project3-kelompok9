import React, { useEffect, useState } from "react";

// Dark Mode (Bonus): toggle tema gelap/terang.
// Pilihan tema disimpan di localStorage agar tetap konsisten saat reload.
function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      title={theme === "light" ? "Aktifkan mode gelap" : "Aktifkan mode terang"}
      aria-label="Toggle dark mode"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}

export default ThemeToggle;
