import React from "react";
import { NETWORKS, DEFAULT_CHAIN_ID } from "../utils/contract";

// Peringatan jika MetaMask berada di jaringan yang tidak didukung.
// Aplikasi mendukung beberapa jaringan (Multiple Network Support),
// jadi pengguna ditawari berpindah ke jaringan default.
function NetworkWarning({ onSwitch }) {
  const supported = Object.values(NETWORKS)
    .map((n) => n.name)
    .join(" atau ");

  return (
    <div className="network-warning">
      <span>
        ⚠️ MetaMask Anda berada di jaringan yang tidak didukung. Aplikasi ini
        berjalan di <strong>{supported}</strong>.
      </span>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onSwitch(DEFAULT_CHAIN_ID)}
      >
        Pindah ke {NETWORKS[DEFAULT_CHAIN_ID].name}
      </button>
    </div>
  );
}

export default NetworkWarning;
