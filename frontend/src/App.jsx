import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getContract, parseError, getDeadlineStatus } from "./utils/helpers";
import { EXPECTED_CHAIN_ID, EXPECTED_CHAIN_HEX } from "./utils/contract";
import ConnectWallet from "./components/ConnectWallet";
import AccountBar from "./components/AccountBar";
import NetworkWarning from "./components/NetworkWarning";
import StatusBanner from "./components/StatusBanner";
import ReminderBanner from "./components/ReminderBanner";
import TodoForm from "./components/TodoForm";
import FilterBar from "./components/FilterBar";
import TodoList from "./components/TodoList";
import ShareForm from "./components/ShareForm";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [todos, setTodos] = useState([]);
  const [todoCount, setTodoCount] = useState(0);
  const [shareId, setShareId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [orderIds, setOrderIds] = useState([]); // urutan tampilan (drag-drop)
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [error, setError] = useState("");

  const isCorrectNetwork = chainId === EXPECTED_CHAIN_ID;

  // --- Network detection ---
  const readChainId = useCallback(async () => {
    if (!window.ethereum) return;
    const id = await window.ethereum.request({ method: "eth_chainId" });
    setChainId(parseInt(id, 16));
  }, []);

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: EXPECTED_CHAIN_HEX }],
      });
    } catch (err) {
      // 4902 = jaringan belum ditambahkan ke MetaMask -> tambahkan otomatis
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: EXPECTED_CHAIN_HEX,
              chainName: "Hardhat Local",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            },
          ],
        });
      } else {
        setError(parseError(err));
      }
    }
  };

  // --- Wallet connection ---
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Silakan instal ekstensi MetaMask terlebih dahulu!");
      return;
    }
    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      await readChainId();
      setError("");
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  // --- Disconnect wallet ---
  const disconnectWallet = async () => {
    // Best-effort: cabut izin akses akun agar koneksi berikutnya meminta ulang.
    // Tidak semua versi wallet mendukung, jadi diabaikan jika gagal.
    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch {
      /* abaikan: wallet tidak mendukung revoke */
    }
    setAccount("");
    setTodos([]);
    setTodoCount(0);
    setShareId(null);
    setTxStatus("");
    setError("");
  };

  // --- Read operations (2): getTodos + userTodoCount ---
  const fetchData = useCallback(async () => {
    if (!window.ethereum || !account) return;
    try {
      setLoading(true);
      const contract = await getContract(false);

      const list = await contract.getTodos();          // READ #1
      const count = await contract.userTodoCount(account); // READ #2

      setTodos(list);
      setTodoCount(Number(count));
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setError(
        "Gagal membaca data dari blockchain. Pastikan kontrak sudah ter-deploy dan jaringan benar."
      );
    } finally {
      setLoading(false);
    }
  }, [account]);

  // --- Generic write wrapper: handle loading + tx lifecycle + error ---
  const runTx = async (buildTx) => {
    try {
      setLoading(true);
      setTxStatus("pending");
      setError("");

      const contract = await getContract(true);
      const tx = await buildTx(contract);
      await tx.wait(); // tunggu konfirmasi blok

      setTxStatus("success");
      await fetchData(); // refresh data setelah state berubah
      return true;
    } catch (err) {
      setTxStatus("failed");
      setError(parseError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- Write operations (4): addTodo, completeTodo, deleteTodo, shareTodo ---
  const handleAdd = (content, deadline, priority) => {
    const ts = deadline ? Math.floor(new Date(deadline).getTime() / 1000) : 0;
    return runTx((c) => c.addTodo(content, ts, priority));
  };

  const handleComplete = (id) => runTx((c) => c.completeTodo(id));

  const handleDelete = (id) => runTx((c) => c.deleteTodo(id));

  const handleShare = async (id, to) => {
    const ok = await runTx((c) => c.shareTodo(id, to));
    if (ok) setShareId(null);
    return ok;
  };

  // --- Drag & drop reorder (urutan disimpan per-akun di localStorage) ---
  const persistOrder = (ids) => {
    setOrderIds(ids);
    if (account) localStorage.setItem(`todoOrder_${account}`, JSON.stringify(ids));
  };

  // Todo diurutkan sesuai orderIds; tugas baru yang belum tercatat ditaruh di akhir.
  const orderedTodos = useMemo(() => {
    const byId = new Map(todos.map((t) => [Number(t.id), t]));
    const result = [];
    orderIds.forEach((id) => {
      if (byId.has(id)) {
        result.push(byId.get(id));
        byId.delete(id);
      }
    });
    todos.forEach((t) => {
      if (byId.has(Number(t.id))) result.push(t);
    });
    return result;
  }, [todos, orderIds]);

  const handleReorder = (draggedId, targetId) => {
    if (draggedId === targetId) return;
    const ids = orderedTodos.map((t) => Number(t.id));
    const from = ids.indexOf(draggedId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(from, 1);
    ids.splice(to, 0, draggedId);
    persistOrder(ids);
  };

  // --- Filter all/active/completed ---
  const displayedTodos = useMemo(() => {
    if (filter === "active") return orderedTodos.filter((t) => !t.completed);
    if (filter === "completed") return orderedTodos.filter((t) => t.completed);
    return orderedTodos;
  }, [orderedTodos, filter]);

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }),
    [todos]
  );

  // --- Deadline reminder ---
  const reminders = useMemo(() => {
    let overdue = 0;
    let soon = 0;
    todos.forEach((t) => {
      const s = getDeadlineStatus(t);
      if (s === "overdue") overdue++;
      else if (s === "soon") soon++;
    });
    return { overdue, soon };
  }, [todos]);

  // Muat urutan tersimpan saat akun berganti
  useEffect(() => {
    if (!account) {
      setOrderIds([]);
      return;
    }
    const saved = localStorage.getItem(`todoOrder_${account}`);
    setOrderIds(saved ? JSON.parse(saved) : []);
  }, [account]);

  // Ambil data saat akun/jaringan siap
  useEffect(() => {
    if (account && isCorrectNetwork) fetchData();
  }, [account, isCorrectNetwork, fetchData]);

  // Listener perubahan akun & jaringan dari MetaMask
  useEffect(() => {
    if (!window.ethereum) return;
    readChainId();

    const handleAccounts = (accs) => {
      setAccount(accs[0] || "");
      if (!accs[0]) {
        setTodos([]);
        setTodoCount(0);
      }
    };
    const handleChain = (id) => setChainId(parseInt(id, 16));

    window.ethereum.on("accountsChanged", handleAccounts);
    window.ethereum.on("chainChanged", handleChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccounts);
      window.ethereum.removeListener("chainChanged", handleChain);
    };
  }, [readChainId]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Blockchain To-Do List</h1>
        <p className="app-tagline">Tugas Anda tersimpan permanen di blockchain.</p>
      </header>

      {!account ? (
        <ConnectWallet onConnect={connectWallet} loading={loading} />
      ) : (
        <>
          <AccountBar
            account={account}
            isCorrectNetwork={isCorrectNetwork}
            todoCount={todoCount}
            onDisconnect={disconnectWallet}
          />

          {!isCorrectNetwork && <NetworkWarning onSwitch={switchNetwork} />}

          <StatusBanner txStatus={txStatus} error={error} />

          {isCorrectNetwork && (
            <>
              <TodoForm onAdd={handleAdd} loading={loading} />

              {shareId !== null && (
                <ShareForm
                  shareId={shareId}
                  onShare={handleShare}
                  onCancel={() => setShareId(null)}
                  loading={loading}
                />
              )}

              <ReminderBanner overdue={reminders.overdue} soon={reminders.soon} />

              <section className="todo-list-section">
                <h2>Daftar Tugas Anda</h2>
                <FilterBar filter={filter} onChange={setFilter} counts={counts} />
                <TodoList
                  todos={displayedTodos}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onShare={(id) => setShareId(id)}
                  onReorder={handleReorder}
                  reorderable={true}
                  loading={loading}
                />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
