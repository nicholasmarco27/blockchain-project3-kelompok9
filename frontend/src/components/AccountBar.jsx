import React from "react";
import { formatAddress, getNetworkName } from "../utils/helpers";
import NetworkSwitcher from "./NetworkSwitcher";

// Menampilkan address akun yang terkoneksi, status jaringan + switcher,
// jumlah tugas user (operasi read kedua: userTodoCount), indikator
// event real-time, dan tombol disconnect.
function AccountBar({
  account,
  chainId,
  isSupportedNetwork,
  todoCount,
  liveActive,
  onSwitchNetwork,
  onDisconnect,
}) {
  return (
    <div className="account-bar">
      <div className="account-info">
        <span className="account-label">Dompet Terhubung</span>
        <span className="account-address" title={account}>
          {formatAddress(account)}
        </span>
      </div>
      <div className="account-meta">
        <span className={`badge ${isSupportedNetwork ? "badge-ok" : "badge-warn"}`}>
          {isSupportedNetwork
            ? `● ${getNetworkName(chainId)}`
            : "● Jaringan Salah"}
        </span>
        {isSupportedNetwork && liveActive && (
          <span className="badge badge-live" title="Event listening aktif — UI update otomatis">
            <span className="live-dot" /> Live
          </span>
        )}
        <span className="badge badge-count">{todoCount} tugas aktif</span>
        <NetworkSwitcher currentChainId={chainId} onSwitch={onSwitchNetwork} />
        <button className="btn btn-secondary btn-sm" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default AccountBar;
