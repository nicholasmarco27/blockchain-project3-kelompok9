pragma solidity ^0.8.20;

contract TodoList {
    address public owner;
    uint256 public totalTodos;

    enum Priority { LOW, MEDIUM, HIGH }

    struct Todo {
        uint256 id;
        string  content;
        bool    completed;
        bool    exists;
        uint256 deadline;
        Priority priority;
        address sharedBy;   // address(0) if not shared
    }

    // Mappings 
    mapping(address => Todo[]) private userTodos;
    mapping(address => uint256) public userTodoCount;

    // Events 
    event TodoAdded(address indexed user, uint256 indexed id, string content);
    event TodoCompleted(address indexed user, uint256 indexed id);
    event TodoDeleted(address indexed user, uint256 indexed id);
    event TodoShared(address indexed from, address indexed to, uint256 indexed originalId);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier todoExists(uint256 _id) {
        require(_id < userTodos[msg.sender].length, "Todo does not exist");
        require(userTodos[msg.sender][_id].exists, "Todo has been deleted");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Core functions
    function addTodo(
        string  memory _content,
        uint256        _deadline,
        Priority       _priority
    ) external returns (uint256) {
        require(bytes(_content).length > 0, "Content cannot be empty");

        uint256 id = userTodos[msg.sender].length;
        userTodos[msg.sender].push(Todo({
            id:        id,
            content:   _content,
            completed: false,
            exists:    true,
            deadline:  _deadline,
            priority:  _priority,
            sharedBy:  address(0)
        }));

        userTodoCount[msg.sender]++;
        totalTodos++;

        emit TodoAdded(msg.sender, id, _content);
        return id;
    }

    function completeTodo(uint256 _id) external todoExists(_id) {
        require(!userTodos[msg.sender][_id].completed, "Todo already completed");
        userTodos[msg.sender][_id].completed = true;
        emit TodoCompleted(msg.sender, _id);
    }

    function deleteTodo(uint256 _id) external todoExists(_id) {
        userTodos[msg.sender][_id].exists = false;
        userTodoCount[msg.sender]--;
        totalTodos--;
        emit TodoDeleted(msg.sender, _id);
    }

    // View functions

    function getTodo(uint256 _id) external view todoExists(_id) returns (Todo memory) {
        return userTodos[msg.sender][_id];
    }

    function getTodos() external view returns (Todo[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < userTodos[msg.sender].length; i++) {
            if (userTodos[msg.sender][i].exists) count++;
        }

        Todo[] memory active = new Todo[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < userTodos[msg.sender].length; i++) {
            if (userTodos[msg.sender][i].exists) {
                active[j] = userTodos[msg.sender][i];
                j++;
            }
        }
        return active;
    }

    // Owner-Only Functions

    function getTotalTodos() external view onlyOwner returns (uint256) {
        return totalTodos;
    }

    // Share todo

    function shareTodo(uint256 _id, address _to) external todoExists(_id) {
        require(_to != address(0), "Invalid address");
        require(_to != msg.sender, "Cannot share with yourself");

        Todo memory t = userTodos[msg.sender][_id];
        uint256 newId = userTodos[_to].length;

        userTodos[_to].push(Todo({
            id:        newId,
            content:   t.content,
            completed: false,
            exists:    true,
            deadline:  t.deadline,
            priority:  t.priority,
            sharedBy:  msg.sender
        }));

        userTodoCount[_to]++;
        totalTodos++;

        emit TodoShared(msg.sender, _to, _id);
    }
}
