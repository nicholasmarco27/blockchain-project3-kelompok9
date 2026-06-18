import React from "react";

// Menampilkan feedback transaksi (pending / success / failed) dan pesan error.
function StatusBanner({ txStatus, error }) {
  if (!txStatus && !error) return null;

  const statusMap = {
    pending: { cls: "status-pending", text: "⏳ Transaksi sedang diproses ke blockchain..." },
    success: { cls: "status-success", text: "✅ Transaksi berhasil dikonfirmasi!" },
    failed: { cls: "status-failed", text: "❌ Transaksi gagal." },
  };

  return (
    <div className="status-area">
      {txStatus && statusMap[txStatus] && (
        <div className={`status-banner ${statusMap[txStatus].cls}`}>
          {statusMap[txStatus].text}
        </div>
      )}
      {error && <div className="status-banner status-error">{error}</div>}
    </div>
  );
}

export default StatusBanner;
