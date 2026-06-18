import React from "react";
import { formatAddress } from "../utils/helpers";

// Menampilkan address akun yang terkoneksi, status jaringan,
// jumlah tugas user (operasi read kedua: userTodoCount), dan tombol disconnect.
function AccountBar({ account, isCorrectNetwork, todoCount, onDisconnect }) {
  return (
    <div className="account-bar">
      <div className="account-info">
        <span className="account-label">Dompet Terhubung</span>
        <span className="account-address" title={account}>
          {formatAddress(account)}
        </span>
      </div>
      <div className="account-meta">
        <span className={`badge ${isCorrectNetwork ? "badge-ok" : "badge-warn"}`}>
          {isCorrectNetwork ? "● Hardhat Local" : "● Jaringan Salah"}
        </span>
        <span className="badge badge-count">{todoCount} tugas aktif</span>
        <button className="btn btn-secondary btn-sm" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default AccountBar;
