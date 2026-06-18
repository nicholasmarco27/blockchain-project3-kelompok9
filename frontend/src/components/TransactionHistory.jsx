import React from "react";
import { getExplorerTxUrl } from "../utils/helpers";

// Transaction History (Bonus): menampilkan riwayat transaksi yang
// dikirim user (add/complete/delete/share) beserta status & hash.
// Pada jaringan dengan block explorer (Sepolia), hash menjadi tautan
// ke Etherscan.
const STATUS_META = {
  pending: { cls: "tx-pending", icon: "⏳", text: "Diproses" },
  success: { cls: "tx-success", icon: "✅", text: "Berhasil" },
  failed: { cls: "tx-failed", icon: "❌", text: "Gagal" },
};

const shortHash = (h) => (h ? `${h.slice(0, 10)}…${h.slice(-6)}` : "");

const formatTime = (ts) =>
  new Date(ts).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function TransactionHistory({ history, onClear }) {
  if (!history || history.length === 0) return null;

  return (
    <section className="card tx-history">
      <div className="tx-history-head">
        <h3>Riwayat Transaksi</h3>
        <button className="btn btn-secondary btn-sm" onClick={onClear}>
          Bersihkan
        </button>
      </div>

      <ul className="tx-list">
        {history.map((tx) => {
          const meta = STATUS_META[tx.status] || STATUS_META.pending;
          const url = getExplorerTxUrl(tx.chainId, tx.hash);
          return (
            <li key={tx.hash} className="tx-row">
              <span className={`tx-status ${meta.cls}`}>
                {meta.icon} {meta.text}
              </span>
              <span className="tx-label">{tx.label}</span>
              <span className="tx-hash">
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {shortHash(tx.hash)} ↗
                  </a>
                ) : (
                  shortHash(tx.hash)
                )}
              </span>
              <span className="tx-time">{formatTime(tx.ts)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default TransactionHistory;
