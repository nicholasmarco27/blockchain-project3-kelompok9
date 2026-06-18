export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Jaringan Hardhat lokal
export const EXPECTED_CHAIN_ID = 31337;
export const EXPECTED_CHAIN_HEX = "0x7a69"; // 31337 dalam hex

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
];
