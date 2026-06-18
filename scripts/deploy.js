const { ethers, network } = require("hardhat");

// Block explorer per jaringan (untuk menampilkan tautan setelah deploy).
const EXPLORERS = {
  sepolia: "https://sepolia.etherscan.io",
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Network:", network.name, `(chainId ${network.config.chainId ?? "local"})`);
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  const TodoList = await ethers.getContractFactory("TodoList");
  const todoList = await TodoList.deploy();
  await todoList.waitForDeployment();

  const address = await todoList.getAddress();
  console.log("\nTodoList deployed to:", address);
  console.log("Owner:", await todoList.owner());

  const explorer = EXPLORERS[network.name];
  if (explorer) {
    console.log("Explorer:", `${explorer}/address/${address}`);
  }

  console.log("\n--- Copy this address ---");
  console.log(`const CONTRACT_ADDRESS = "${address}";`);
  if (network.name === "sepolia") {
    console.log(
      `\nUntuk frontend, set environment variable:\n  VITE_SEPOLIA_CONTRACT=${address}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
