import { ethers } from "ethers";
import { NETWORKS, CONTRACT_ABI } from "./contract";

// Membuat instance contract. needSigner=true untuk transaksi write,
// false (default) untuk operasi read.
// Alamat kontrak dipilih otomatis sesuai jaringan aktif (Multiple Network Support).
export const getContract = async (needSigner = false) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const { chainId } = await provider.getNetwork();
  const cfg = NETWORKS[Number(chainId)];

  if (!cfg) {
    throw new Error(
      "Jaringan tidak didukung. Silakan beralih ke Hardhat Local atau Sepolia Testnet."
    );
  }
  if (!cfg.contractAddress) {
    throw new Error(
      `Kontrak belum di-deploy di ${cfg.name}. Lengkapi alamat kontrak terlebih dahulu.`
    );
  }

  if (needSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(cfg.contractAddress, CONTRACT_ABI, signer);
  }
  return new ethers.Contract(cfg.contractAddress, CONTRACT_ABI, provider);
};

// Nama jaringan singkat dari chainId (untuk badge & UI).
export const getNetworkName = (chainId) =>
  NETWORKS[Number(chainId)]?.shortName || "Tidak Dikenal";

// URL block explorer untuk sebuah transaksi (null jika jaringan tanpa explorer).
export const getExplorerTxUrl = (chainId, hash) => {
  const explorer = NETWORKS[Number(chainId)]?.blockExplorer;
  return explorer ? `${explorer}/tx/${hash}` : null;
};

// Memendekkan address: 0x1234...abcd
export const formatAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

export const getPriorityText = (p) =>
  ["LOW", "MEDIUM", "HIGH"][Number(p)] ?? "LOW";

export const getPriorityClass = (p) =>
  ["low", "medium", "high"][Number(p)] ?? "low";

// Konversi unix timestamp (detik) ke teks tanggal lokal, null jika tidak ada.
export const formatDeadline = (ts) =>
  Number(ts) > 0 ? new Date(Number(ts) * 1000).toLocaleString() : null;

export const isShared = (sharedBy) =>
  sharedBy && sharedBy !== ethers.ZeroAddress;

// Status deadline untuk fitur reminder:
// 'overdue' = sudah lewat, 'soon' = < 24 jam lagi, 'none' = aman/tidak ada.
// Tugas yang sudah selesai tidak dianggap perlu reminder.
export const getDeadlineStatus = (todo) => {
  const ts = Number(todo.deadline);
  if (!ts || todo.completed) return "none";
  const ms = ts * 1000;
  const now = Date.now();
  if (ms < now) return "overdue";
  if (ms - now <= 24 * 60 * 60 * 1000) return "soon";
  return "none";
};

// Mengubah error teknis blockchain menjadi pesan yang ramah pengguna.
export const parseError = (err) => {
  if (err?.code === "ACTION_REJECTED" || err?.code === 4001)
    return "Transaksi dibatalkan melalui MetaMask.";
  if (err?.reason) return err.reason;
  if (err?.shortMessage) return err.shortMessage;
  if (err?.message) return err.message;
  return "Terjadi kesalahan yang tidak terduga.";
};
