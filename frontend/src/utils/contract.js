// ============================================================
// Multiple Network Support (Bonus)
// ------------------------------------------------------------
// Konfigurasi semua jaringan yang didukung aplikasi. Aplikasi
// memilih alamat kontrak secara otomatis berdasarkan chainId
// yang sedang aktif di MetaMask, sehingga user bisa berpindah
// antara jaringan lokal (Hardhat) dan testnet (Sepolia) tanpa
// mengubah kode.
//
// Alamat kontrak dapat diisi langsung di sini, atau lewat
// environment variable saat hosting (Vercel/Netlify):
//   VITE_LOCAL_CONTRACT    -> alamat di Hardhat Local
//   VITE_SEPOLIA_CONTRACT  -> alamat di Sepolia Testnet
// ============================================================

export const NETWORKS = {
  // Hardhat Local
  31337: {
    chainId: 31337,
    chainHex: "0x7a69", // 31337 dalam hex
    name: "Hardhat Local",
    shortName: "Local",
    contractAddress:
      import.meta.env.VITE_LOCAL_CONTRACT ||
      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    rpcUrls: ["http://127.0.0.1:8545"],
    currency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorer: "", // tidak ada explorer untuk jaringan lokal
  },

  // Sepolia Testnet
  11155111: {
    chainId: 11155111,
    chainHex: "0xaa36a7", // 11155111 dalam hex
    name: "Sepolia Testnet",
    shortName: "Sepolia",
    // Isi setelah menjalankan: npm run deploy:sepolia
    contractAddress: import.meta.env.VITE_SEPOLIA_CONTRACT || "",
    rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
    currency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
    blockExplorer: "https://sepolia.etherscan.io",
  },
};

// Daftar chainId yang didukung (dipakai untuk validasi jaringan).
export const SUPPORTED_CHAIN_IDS = Object.keys(NETWORKS).map(Number);

// Jaringan default yang disarankan saat user salah jaringan.
export const DEFAULT_CHAIN_ID = 31337;

export const CONTRACT_ABI = [
  // --- Write operations ---
  "function addTodo(string memory _content, uint256 _deadline, uint8 _priority) external returns (uint256)",
  "function completeTodo(uint256 _id) external",
  "function deleteTodo(uint256 _id) external",
  "function shareTodo(uint256 _id, address _to) external",

  // --- Read operations ---
  "function getTodos() external view returns (tuple(uint256 id, string content, bool completed, bool exists, uint256 deadline, uint8 priority, address sharedBy)[])",
  "function userTodoCount(address) external view returns (uint256)",
  "function totalTodos() external view returns (uint256)",

  // --- Events (dipakai untuk Event Listening real-time) ---
  "event TodoAdded(address indexed user, uint256 indexed id, string content)",
  "event TodoCompleted(address indexed user, uint256 indexed id)",
  "event TodoDeleted(address indexed user, uint256 indexed id)",
  "event TodoShared(address indexed from, address indexed to, uint256 indexed originalId)",
];
