export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  // Tambahkan parameter _deadline (uint256) dan _priority (uint8)
  "function addTodo(string memory _content, uint256 _deadline, uint8 _priority) external returns (uint256)",
  "function completeTodo(uint256 _id) external",
  "function deleteTodo(uint256 _id) external",
  "function shareTodo(uint256 _id, address _to) external",
  // Sesuaikan tuple kembalian dengan isi struct Todo asli
  "function getTodos() external view returns (tuple(uint256 id, string content, bool completed, bool exists, uint256 deadline, uint8 priority, address sharedBy)[])"
];