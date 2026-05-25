# TodoList On-Chain

## Deskripsi

Aplikasi **Todo List** yang seluruh datanya tersimpan di blockchain menggunakan **Solidity** dan **Hardhat**. Setiap pengguna memiliki daftar todo pribadi yang dikelola melalui smart contract. Mendukung fitur bonus: deadline, priority level, dan shared todo.

## Anggota Kelompok

- Nicholas Marco Weinandra (5027221042)

## Fitur

### Fitur Wajib
- **Tambah Todo** — user dapat menambahkan item todo baru dengan konten teks
- **Tandai Selesai** — user dapat menandai todo sebagai completed
- **Hapus Todo** — user dapat menghapus todo yang tidak diperlukan
- **List Pribadi** — setiap address memiliki daftar todo yang terpisah

### Fitur Bonus
- **Deadline** — setiap todo bisa diberi batas waktu (unix timestamp)
- **Priority Level** — tiga tingkat prioritas: LOW, MEDIUM, HIGH
- **Shared Todo** — user dapat berbagi todo ke address lain

## Arsitektur Smart Contract

| Komponen | Detail |
|---|---|
| **State Variables** | `owner`, `totalTodos`, `userTodos` (mapping), `userTodoCount` (mapping) |
| **Functions** | `addTodo`, `completeTodo`, `deleteTodo`, `getTodo`, `getTodos`, `getTotalTodos`, `shareTodo` |
| **Modifiers** | `onlyOwner`, `todoExists` |
| **Events** | `TodoAdded`, `TodoCompleted`, `TodoDeleted`, `TodoShared` |
| **Mappings** | `mapping(address => Todo[])`, `mapping(address => uint256)` |

## Cara Menjalankan

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
npm install
```

### Compile

```bash
npx hardhat compile
```

### Test

```bash
npx hardhat test
```

Untuk coverage:

```bash
npx hardhat coverage
```

### Deploy (Local)

Terminal 1 — jalankan local blockchain:

```bash
npx hardhat node
```

Terminal 2 — deploy contract:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Interact (Opsional)

Setelah deploy, salin alamat contract ke `scripts/interact.js` pada variabel `CONTRACT_ADDRESS`, lalu:

```bash
npx hardhat run scripts/interact.js --network localhost
```

## Contract Address


```
Contract Address : 0x5FbDB2315678afecb367f032d93F642f64180aa3
Network          : Hardhat Local (chainId 31337)
Deployer         : 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

## Struktur Project

```
project2/
├── contracts/
│   └── TodoList.sol        # Smart contract utama
├── test/
│   └── TodoList.test.js    # 25+ unit tests
├── scripts/
│   ├── deploy.js           # Deployment script
│   └── interact.js         # Demo interaksi
├── hardhat.config.js
├── package.json
├── .gitignore
└── README.md
```

## Test Coverage

| Kategori | Test Cases |
|---|---|
| Deployment | 3 |
| Add Todo (Positive + Event + Negative) | 5 |
| Complete Todo (Positive + Event + Negative) | 4 |
| Delete Todo (Positive + Event + Negative) | 5 |
| Get Todos | 2 |
| Access Control | 2 |
| Bonus: Priority & Deadline | 2 |
| Bonus: Share Todo | 5 |
| **Total** | **28** |

## Screenshot

> Tambahkan screenshot di sini setelah demo

| No | Screenshot | Keterangan |
|---|---|---|
| 1 | ![compile](screenshots/compile1.png)<br>![compile](screenshots/compile2.png) | `npx hardhat compile` berhasil |
| 2 | ![test](screenshots/testing.png) | `npx hardhat test` semua passing |
| 3 | ![deploy](screenshots/contactaddress.png) | Output contract address |
| 4 | ![metamask](screenshots/metamask1.png)<br>![metamask](screenshots/metamask2.png)<br>![metamask](screenshots/metamask3.png)| MetaMask terhubung ke Hardhat Local |
| 5 | ![tx1](screenshots/transaction.png) | Transaksi addTodo berhasil |
| 6 | ![tx2](screenshots/transaction.png) | Transaksi completeTodo berhasil |

## MetaMask Setup

1. Buka MetaMask → **Add Network** → **Add a network manually**
2. Isi konfigurasi:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
3. Import akun: gunakan salah satu private key yang ditampilkan saat `npx hardhat node`
