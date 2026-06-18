import React, { useState } from "react";
import { ethers } from "ethers";

// Form untuk membagikan tugas ke address lain (write operation: shareTodo).
function ShareForm({ shareId, onShare, onCancel, loading }) {
  const [address, setAddress] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi format address di frontend sebelum kirim ke blockchain.
    if (!ethers.isAddress(address)) {
      setLocalError("Format address tidak valid (harus 0x... 42 karakter).");
      return;
    }
    setLocalError("");
    const ok = await onShare(shareId, address);
    if (ok) setAddress("");
  };

  return (
    <form className="card share-form" onSubmit={handleSubmit}>
      <h4>Bagikan Tugas #{shareId}</h4>
      <input
        type="text"
        className="input"
        placeholder="Address tujuan (0x...)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        disabled={loading}
        required
      />
      {localError && <p className="inline-error">{localError}</p>}
      <div className="share-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Tugas"}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel} disabled={loading}>
          Batal
        </button>
      </div>
    </form>
  );
}

export default ShareForm;
