# Final Project Blockchain - To-Do List

## Deskripsi

Aplikasi To-Do List terdesentralisasi (dApp) yang mengintegrasikan smart contract Solidity dengan frontend berbasis React dan Vite. Aplikasi ini memungkinkan pengguna untuk mencatat aktivitas tugas, menentukan batas waktu (deadline), mengatur tingkat prioritas, menandai tugas selesai, serta membagikan tugas secara peer-to-peer ke alamat wallet lain langsung di atas jaringan blockchain lokal.


## Anggota Kelompok 9

- Nicholas Marco Weinandra (5027221042)
- Muhammad Arsy Athallah
- Muhammad Rifqi Oktaviansyah (5027221067)

## Tech Stack
- **Smart Contract:** Solidity v0.8.20 + Hardhat
- **Frontend:** React + Vite
- **Web3 Library:** ethers.js (v6)
- **Wallet Extension:** MetaMask

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
- **Filter** — tampilkan tugas berdasarkan status: Semua / Aktif / Selesai
- **Drag & Drop Reorder** — urutkan tugas dengan seret-lepas (urutan disimpan per-akun di localStorage)
- **Deadline Reminder** — badge "Terlewat" / "Segera" dan banner pengingat untuk tugas yang jatuh tempo < 24 jam

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
- MetaMask Browser Extension
- Git

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

### Deploy di Local

Terminal 1 — jalankan local blockchain:

```bash
npx hardhat node
```

Terminal 2 — deploy contract:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Interact

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
│   └── TodoList.sol
├── test/
│   └── TodoList.test.js
├── scripts/
│   ├── deploy.js
│   └── interact.js
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ConnectWallet.jsx   # Koneksi MetaMask
│       │   ├── AccountBar.jsx      # Tampilan akun + jumlah tugas (read)
│       │   ├── NetworkWarning.jsx  # Warning jika jaringan salah
│       │   ├── StatusBanner.jsx    # Feedback transaksi & error
│       │   ├── TodoForm.jsx        # Tambah tugas (write)
│       │   ├── TodoList.jsx        # Daftar tugas (read)
│       │   ├── TodoItem.jsx        # Aksi: selesai / hapus / bagikan (write)
│       │   └── ShareForm.jsx       # Bagikan tugas (write)
│       ├── utils/
│       │   ├── contract.js         # Alamat & ABI contract
│       │   └── helpers.js          # getContract, formatter, parseError
│       └── App.jsx                 # State management & orkestrasi Web3
├── hardhat.config.js
├── package.json
├── .gitignore
└── README.md
```

### Pemenuhan Requirement Frontend & Integrasi

| Komponen | Implementasi |
|---|---|
| **Components (min 4)** | 8 komponen terpisah di `frontend/src/components/` |
| **Read Operations (min 2)** | `getTodos()` + `userTodoCount(address)` |
| **Write Operations (min 2)** | `addTodo`, `completeTodo`, `deleteTodo`, `shareTodo` |
| **Loading States** | State `loading` + status `pending` di setiap transaksi |
| **Error Handling** | `parseError()` → pesan ramah pengguna |
| **Wallet Connection** | `eth_requestAccounts` + listener `accountsChanged` |
| **Network Detection** | Deteksi `chainId` 31337 + warning + tombol switch jaringan |
| **Responsive Design** | CSS mobile-first dengan media query |

## Test Coverage

| Kategori | Jumlah Test Cases |
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


| No | Screenshot | Keterangan |
|---|---|---|
| 1 | ![compile](screenshots/compile1.png)<br>![compile](screenshots/compile2.png) | `npx hardhat compile` berhasil |
| 2 | ![test](screenshots/testing.png) | `npx hardhat test` semua passed |
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

## Cara Menjalankan 
### Prerequisites
- Node.js v18+
- MetaMask Browser Extension
- Git

### 1. Clone & Install Dependencies
```bash
# Clone repositori ini
git clone [url-repo]
cd blockchain-project3-team-alpha

# Install dependencies untuk root (Hardhat/Backend)
npm install

# Install dependencies untuk Frontend
cd frontend
npm install
cd ..
```
### 2. Jalankan Local Blockchain (Hardhat Node)
Buka terminal utama kamu, lalu nyalakan simulator blockchain lokal:
```bash
npx hardhat node
```
Biarkan terminal ini tetap terbuka dan menyala.

### 3. Deploy Smart Contract
Buka terminal baru (Terminal 2), jalankan perintah migrasi ini untuk memasang kontrak pintar ke localhost:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Salin alamat kontrak yang muncul setelah deploy berhasil.

### 4. Konfigurasi Alamat Kontrak di Frontend
Buka berkas `frontend/src/utils/contract.js`, lalu perbarui nilai variabel `CONTRACT_ADDRESS` dengan alamat kontrak baru yang baru saja kamu salin:
```bash
export const CONTRACT_ADDRESS = "ISI_ALAMAT_KONTRAK_KAMU_DISINI";
```

### 5. Jalankan Aplikasi Frontend React
Masuk ke direktori folder frontend pada Terminal 2, lalu nyalakan server lokal:
```bash
cd frontend
npm run dev
```
Buka browser kamu dan akses link: `http://localhost:5173`