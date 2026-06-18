import React from "react";

// Komponen tombol koneksi ke MetaMask (ditampilkan saat belum terhubung).
function ConnectWallet({ onConnect, loading }) {
  return (
    <div className="connect-screen">
      <p className="connect-subtitle">
        Hubungkan dompet MetaMask Anda untuk mulai mencatat tugas di blockchain.
      </p>
      <button className="btn btn-primary btn-lg" onClick={onConnect} disabled={loading}>
        {loading ? "Menghubungkan..." : "🦊 Connect Wallet (MetaMask)"}
      </button>
    </div>
  );
}

export default ConnectWallet;
