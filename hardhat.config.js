require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Variabel rahasia diambil dari file .env (lihat .env.example).
// Jangan pernah commit .env yang berisi private key asli!
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Sepolia Testnet (Bonus: Deploy ke Testnet)
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  // Untuk verifikasi kontrak di Etherscan (opsional)
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
