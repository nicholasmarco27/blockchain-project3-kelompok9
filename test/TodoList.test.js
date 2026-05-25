const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TodoList", function () {
  let todoList;
  let owner, user1, user2;

  const Priority = { LOW: 0, MEDIUM: 1, HIGH: 2 };
  const NO_DEADLINE = 0;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const TodoList = await ethers.getContractFactory("TodoList");
    todoList = await TodoList.deploy();
    await todoList.waitForDeployment();
  });

  // ─── Deployment ─────────────────────────────────────────────────────────────
  describe("Deployment", function () {
    it("should set the correct owner", async function () {
      expect(await todoList.owner()).to.equal(owner.address);
    });

    it("should initialize totalTodos to zero", async function () {
      expect(await todoList.totalTodos()).to.equal(0);
    });

    it("should initialize userTodoCount to zero for any address", async function () {
      expect(await todoList.userTodoCount(user1.address)).to.equal(0);
    });
  });

  // ─── Add Todo ────────────────────────────────────────────────────────────────
  describe("Add Todo", function () {
    it("should add a todo and increment userTodoCount", async function () {
      await todoList.connect(user1).addTodo("Buy groceries", NO_DEADLINE, Priority.MEDIUM);
      expect(await todoList.userTodoCount(user1.address)).to.equal(1);
    });

    it("should increment totalTodos across users", async function () {
      await todoList.connect(user1).addTodo("Task A", NO_DEADLINE, Priority.LOW);
      await todoList.connect(user2).addTodo("Task B", NO_DEADLINE, Priority.HIGH);
      expect(await todoList.totalTodos()).to.equal(2);
    });

    it("should store the correct todo content", async function () {
      await todoList.connect(user1).addTodo("Learn Solidity", NO_DEADLINE, Priority.HIGH);
      const todo = await todoList.connect(user1).getTodo(0);
      expect(todo.content).to.equal("Learn Solidity");
      expect(todo.completed).to.be.false;
      expect(todo.exists).to.be.true;
    });

    it("should emit TodoAdded event with correct args", async function () {
      await expect(todoList.connect(user1).addTodo("Test task", NO_DEADLINE, Priority.LOW))
        .to.emit(todoList, "TodoAdded")
        .withArgs(user1.address, 0, "Test task");
    });

    it("should fail when content is empty", async function () {
      await expect(todoList.connect(user1).addTodo("", NO_DEADLINE, Priority.LOW))
        .to.be.revertedWith("Content cannot be empty");
    });
  });

  // ─── Complete Todo ───────────────────────────────────────────────────────────
  describe("Complete Todo", function () {
    beforeEach(async function () {
      await todoList.connect(user1).addTodo("Finish homework", NO_DEADLINE, Priority.MEDIUM);
    });

    it("should mark todo as completed", async function () {
      await todoList.connect(user1).completeTodo(0);
      const todo = await todoList.connect(user1).getTodo(0);
      expect(todo.completed).to.be.true;
    });

    it("should emit TodoCompleted event", async function () {
      await expect(todoList.connect(user1).completeTodo(0))
        .to.emit(todoList, "TodoCompleted")
        .withArgs(user1.address, 0);
    });

    it("should fail when completing an already-completed todo", async function () {
      await todoList.connect(user1).completeTodo(0);
      await expect(todoList.connect(user1).completeTodo(0))
        .to.be.revertedWith("Todo already completed");
    });

    it("should fail when todo index is out of bounds", async function () {
      await expect(todoList.connect(user1).completeTodo(99))
        .to.be.revertedWith("Todo does not exist");
    });
  });

  // ─── Delete Todo ─────────────────────────────────────────────────────────────
  describe("Delete Todo", function () {
    beforeEach(async function () {
      await todoList.connect(user1).addTodo("Todo to delete", NO_DEADLINE, Priority.LOW);
    });

    it("should delete todo and decrement userTodoCount", async function () {
      await todoList.connect(user1).deleteTodo(0);
      expect(await todoList.userTodoCount(user1.address)).to.equal(0);
    });

    it("should decrement totalTodos", async function () {
      await todoList.connect(user1).deleteTodo(0);
      expect(await todoList.totalTodos()).to.equal(0);
    });

    it("should emit TodoDeleted event", async function () {
      await expect(todoList.connect(user1).deleteTodo(0))
        .to.emit(todoList, "TodoDeleted")
        .withArgs(user1.address, 0);
    });

    it("should fail when deleting an already-deleted todo", async function () {
      await todoList.connect(user1).deleteTodo(0);
      await expect(todoList.connect(user1).deleteTodo(0))
        .to.be.revertedWith("Todo has been deleted");
    });

    it("should fail when todo index is out of bounds", async function () {
      await expect(todoList.connect(user1).deleteTodo(99))
        .to.be.revertedWith("Todo does not exist");
    });
  });

  // ─── Get Todos ───────────────────────────────────────────────────────────────
  describe("Get Todos", function () {
    it("each user should only see their own todos", async function () {
      await todoList.connect(user1).addTodo("User1 task", NO_DEADLINE, Priority.LOW);
      await todoList.connect(user2).addTodo("User2 task", NO_DEADLINE, Priority.HIGH);

      const todos1 = await todoList.connect(user1).getTodos();
      const todos2 = await todoList.connect(user2).getTodos();

      expect(todos1.length).to.equal(1);
      expect(todos1[0].content).to.equal("User1 task");
      expect(todos2.length).to.equal(1);
      expect(todos2[0].content).to.equal("User2 task");
    });

    it("should exclude deleted todos from getTodos", async function () {
      await todoList.connect(user1).addTodo("Keep this", NO_DEADLINE, Priority.LOW);
      await todoList.connect(user1).addTodo("Delete this", NO_DEADLINE, Priority.LOW);
      await todoList.connect(user1).deleteTodo(0);

      const todos = await todoList.connect(user1).getTodos();
      expect(todos.length).to.equal(1);
      expect(todos[0].content).to.equal("Delete this");
    });
  });

  // ─── Access Control ──────────────────────────────────────────────────────────
  describe("Access Control", function () {
    it("should allow owner to call getTotalTodos", async function () {
      await todoList.connect(user1).addTodo("Task", NO_DEADLINE, Priority.LOW);
      expect(await todoList.connect(owner).getTotalTodos()).to.equal(1);
    });

    it("should revert when non-owner calls getTotalTodos", async function () {
      await expect(todoList.connect(user1).getTotalTodos())
        .to.be.revertedWith("Only owner");
    });
  });

  // ─── Bonus: Priority & Deadline ──────────────────────────────────────────────
  describe("Bonus: Priority and Deadline", function () {
    it("should store the correct priority", async function () {
      await todoList.connect(user1).addTodo("Urgent task", NO_DEADLINE, Priority.HIGH);
      const todo = await todoList.connect(user1).getTodo(0);
      expect(todo.priority).to.equal(Priority.HIGH);
    });

    it("should store the correct deadline", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await todoList.connect(user1).addTodo("Deadline task", deadline, Priority.MEDIUM);
      const todo = await todoList.connect(user1).getTodo(0);
      expect(todo.deadline).to.equal(deadline);
    });
  });

  // ─── Bonus: Share Todo ────────────────────────────────────────────────────────
  describe("Bonus: Share Todo", function () {
    beforeEach(async function () {
      await todoList.connect(user1).addTodo("Shared task", NO_DEADLINE, Priority.MEDIUM);
    });

    it("should share a todo to another user", async function () {
      await todoList.connect(user1).shareTodo(0, user2.address);
      expect(await todoList.userTodoCount(user2.address)).to.equal(1);
    });

    it("should record the original sender in sharedBy", async function () {
      await todoList.connect(user1).shareTodo(0, user2.address);
      const todo = await todoList.connect(user2).getTodo(0);
      expect(todo.sharedBy).to.equal(user1.address);
    });

    it("should emit TodoShared event with correct args", async function () {
      await expect(todoList.connect(user1).shareTodo(0, user2.address))
        .to.emit(todoList, "TodoShared")
        .withArgs(user1.address, user2.address, 0);
    });

    it("should fail when sharing with yourself", async function () {
      await expect(todoList.connect(user1).shareTodo(0, user1.address))
        .to.be.revertedWith("Cannot share with yourself");
    });

    it("should fail when sharing with zero address", async function () {
      await expect(todoList.connect(user1).shareTodo(0, ethers.ZeroAddress))
        .to.be.revertedWith("Invalid address");
    });
  });
});
