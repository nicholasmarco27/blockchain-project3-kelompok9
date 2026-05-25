const { ethers } = require("hardhat");

// Replace after running deploy.js
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const Priority = { LOW: 0, MEDIUM: 1, HIGH: 2 };

async function main() {
  const [owner, user1, user2] = await ethers.getSigners();
  const todoList = await ethers.getContractAt("TodoList", CONTRACT_ADDRESS);

  console.log("=== TodoList Interaction Demo ===\n");

  // 1. Add todos as user1
  console.log("1. Adding todos as user1...");
  let tx = await todoList.connect(user1).addTodo("Buy groceries", 0, Priority.LOW);
  await tx.wait();
  tx = await todoList.connect(user1).addTodo("Finish blockchain project", 0, Priority.HIGH);
  await tx.wait();
  console.log("   Added 2 todos for user1");

  // 2. Add todo as user2
  console.log("\n2. Adding todo as user2...");
  tx = await todoList.connect(user2).addTodo("Review smart contracts", 0, Priority.MEDIUM);
  await tx.wait();
  console.log("   Added 1 todo for user2");

  // 3. List todos
  console.log("\n3. Listing todos for user1:");
  let todos = await todoList.connect(user1).getTodos();
  todos.forEach((t) => {
    const p = ["LOW", "MEDIUM", "HIGH"][t.priority];
    console.log(`   [${t.id}] ${t.content} | Priority: ${p} | Done: ${t.completed}`);
  });

  // 4. Complete a todo
  console.log("\n4. Completing todo #0 for user1...");
  tx = await todoList.connect(user1).completeTodo(0);
  await tx.wait();
  const completed = await todoList.connect(user1).getTodo(0);
  console.log(`   Todo #0 completed: ${completed.completed}`);

  // 5. Delete a todo
  console.log("\n5. Deleting todo #1 for user1...");
  tx = await todoList.connect(user1).deleteTodo(1);
  await tx.wait();
  console.log(`   user1 active count: ${await todoList.userTodoCount(user1.address)}`);

  // 6. Share a todo
  console.log("\n6. user2 shares todo #0 to user1...");
  tx = await todoList.connect(user2).shareTodo(0, user1.address);
  await tx.wait();
  console.log(`   user1 active count after share: ${await todoList.userTodoCount(user1.address)}`);

  // 7. Owner stats
  console.log("\n7. Owner reads total todos:", Number(await todoList.connect(owner).getTotalTodos()));

  console.log("\n=== Demo complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
