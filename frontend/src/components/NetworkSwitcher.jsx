import React from "react";
import { NETWORKS } from "../utils/contract";

// Multiple Network Support (Bonus): dropdown untuk berpindah jaringan
// (Hardhat Local <-> Sepolia Testnet). Pemilihan jaringan memicu
// permintaan switch ke MetaMask.
function NetworkSwitcher({ currentChainId, onSwitch }) {
  const known = NETWORKS[Number(currentChainId)];

  return (
    <label className="network-switcher" title="Pindah jaringan">
      <span className="network-switcher-dot" aria-hidden>🌐</span>
      <select
        className="network-select"
        value={known ? Number(currentChainId) : ""}
        onChange={(e) => onSwitch(Number(e.target.value))}
      >
        {!known && <option value="">Jaringan tidak didukung</option>}
        {Object.values(NETWORKS).map((n) => (
          <option key={n.chainId} value={n.chainId}>
            {n.shortName}
          </option>
        ))}
      </select>
    </label>
  );
}

export default NetworkSwitcher;
