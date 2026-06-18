import React from "react";

// Peringatan jika MetaMask tidak berada di jaringan Hardhat Local (chainId 31337).
function NetworkWarning({ onSwitch }) {
  return (
    <div className="network-warning">
      <span>
        ⚠️ MetaMask Anda berada di jaringan yang salah. Aplikasi ini hanya
        berjalan di <strong>Hardhat Local (Chain ID 31337)</strong>.
      </span>
      <button className="btn btn-secondary btn-sm" onClick={onSwitch}>
        Pindah ke Hardhat Local
      </button>
    </div>
  );
}

export default NetworkWarning;
