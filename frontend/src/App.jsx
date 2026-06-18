import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getContract, parseError, getDeadlineStatus } from "./utils/helpers";
import { NETWORKS, SUPPORTED_CHAIN_IDS, DEFAULT_CHAIN_ID } from "./utils/contract";
import ConnectWallet from "./components/ConnectWallet";
import AccountBar from "./components/AccountBar";
import NetworkWarning from "./components/NetworkWarning";
import StatusBanner from "./components/StatusBanner";
import ReminderBanner from "./components/ReminderBanner";
import TodoForm from "./components/TodoForm";
import FilterBar from "./components/FilterBar";
import TodoList from "./components/TodoList";
import TodoSkeleton from "./components/TodoSkeleton";
import ShareForm from "./components/ShareForm";
import TransactionHistory from "./components/TransactionHistory";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";

const HISTORY_LIMIT = 25;

function App() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [todos, setTodos] = useState([]);
  const [todoCount, setTodoCount] = useState(0);
  const [shareId, setShareId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [orderIds, setOrderIds] = useState([]); // urutan tampilan (drag-drop)
  const [txHistory, setTxHistory] = useState([]); // riwayat transaksi (bonus)
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false); // untuk skeleton
  const [liveActive, setLiveActive] = useState(false); // event listening aktif?
  const [txStatus, setTxStatus] = useState("");
  const [error, setError] = useState("");

  // Multiple Network Support: jaringan dianggap valid jika termasuk daftar yang didukung.
  const isSupportedNetwork = SUPPORTED_CHAIN_IDS.includes(chainId);

  // --- Network detection ---
  const readChainId = useCallback(async () => {
    if (!window.ethereum) return;
    const id = await window.ethereum.request({ method: "eth_chainId" });
    setChainId(parseInt(id, 16));
  }, []);

  // Berpindah jaringan ke chainId tertentu (default Hardhat Local).
  const switchNetwork = async (targetChainId = DEFAULT_CHAIN_ID) => {
    const cfg = NETWORKS[targetChainId];
    if (!cfg || !window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: cfg.chainHex }],
      });
    } catch (err) {
      // 4902 = jaringan belum ditambahkan ke MetaMask -> tambahkan otomatis
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: cfg.chainHex,
              chainName: cfg.name,
              rpcUrls: cfg.rpcUrls,
              nativeCurrency: cfg.currency,
              blockExplorerUrls: cfg.blockExplorer ? [cfg.blockExplorer] : undefined,
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
      setInitialLoading(false);
    }
  }, [account]);

  // --- Transaction History helpers (bonus) ---
  // Riwayat disimpan per-akun di localStorage agar persisten antar sesi.
  const persistHistory = useCallback(
    (list) => {
      if (account) localStorage.setItem(`txHistory_${account}`, JSON.stringify(list));
    },
    [account]
  );

  const recordTx = useCallback(
    (entry) => {
      setTxHistory((prev) => {
        const next = [entry, ...prev].slice(0, HISTORY_LIMIT);
        persistHistory(next);
        return next;
      });
    },
    [persistHistory]
  );

  const updateTxStatus = useCallback(
    (hash, status) => {
      setTxHistory((prev) => {
        const next = prev.map((e) => (e.hash === hash ? { ...e, status } : e));
        persistHistory(next);
        return next;
      });
    },
    [persistHistory]
  );

  const clearHistory = () => {
    setTxHistory([]);
    if (account) localStorage.removeItem(`txHistory_${account}`);
  };

  // --- Generic write wrapper: handle loading + tx lifecycle + history + error ---
  const runTx = async (buildTx, label) => {
    let txHash;
    try {
      setLoading(true);
      setTxStatus("pending");
      setError("");

      const contract = await getContract(true);
      const tx = await buildTx(contract);
      txHash = tx.hash;
      recordTx({ hash: tx.hash, label, status: "pending", ts: Date.now(), chainId });

      await tx.wait(); // tunggu konfirmasi blok

      updateTxStatus(tx.hash, "success");
      setTxStatus("success");
      await fetchData(); // refresh data setelah state berubah
      return true;
    } catch (err) {
      if (txHash) updateTxStatus(txHash, "failed");
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
    return runTx((c) => c.addTodo(content, ts, priority), "Tambah Tugas");
  };

  const handleComplete = (id) => runTx((c) => c.completeTodo(id), "Selesaikan Tugas");

  const handleDelete = (id) => runTx((c) => c.deleteTodo(id), "Hapus Tugas");

  const handleShare = async (id, to) => {
    const ok = await runTx((c) => c.shareTodo(id, to), "Bagikan Tugas");
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

  // Muat urutan + riwayat tersimpan saat akun berganti
  useEffect(() => {
    if (!account) {
      setOrderIds([]);
      setTxHistory([]);
      return;
    }
    const savedOrder = localStorage.getItem(`todoOrder_${account}`);
    setOrderIds(savedOrder ? JSON.parse(savedOrder) : []);
    const savedHistory = localStorage.getItem(`txHistory_${account}`);
    setTxHistory(savedHistory ? JSON.parse(savedHistory) : []);
  }, [account]);

  // Ambil data saat akun/jaringan siap (tandai initial loading untuk skeleton)
  useEffect(() => {
    if (account && isSupportedNetwork) {
      setInitialLoading(true);
      fetchData();
    }
  }, [account, isSupportedNetwork, fetchData]);

  // --- Event Listening (real-time): UI update otomatis saat ada event ---
  // Mendengarkan event kontrak untuk akun ini (termasuk tugas yang
  // dibagikan ke kita oleh orang lain) lalu menyegarkan data otomatis.
  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
    if (!account || !isSupportedNetwork || !window.ethereum) {
      setLiveActive(false);
      return;
    }
    let contract;
    let cancelled = false;

    const onChange = () => fetchDataRef.current();

    (async () => {
      try {
        contract = await getContract(false);
      } catch {
        return; // kontrak belum ada di jaringan ini
      }
      if (cancelled) return;
      contract.on(contract.filters.TodoAdded(account), onChange);
      contract.on(contract.filters.TodoCompleted(account), onChange);
      contract.on(contract.filters.TodoDeleted(account), onChange);
      contract.on(contract.filters.TodoShared(null, account), onChange); // share masuk
      setLiveActive(true);
    })();

    return () => {
      cancelled = true;
      setLiveActive(false);
      if (contract) contract.removeAllListeners();
    };
  }, [account, isSupportedNetwork, chainId]);

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
        <ThemeToggle />
        <h1>📝 Blockchain To-Do List</h1>
        <p className="app-tagline">Tugas Anda tersimpan permanen di blockchain.</p>
      </header>

      {!account ? (
        <ConnectWallet onConnect={connectWallet} loading={loading} />
      ) : (
        <>
          <AccountBar
            account={account}
            chainId={chainId}
            isSupportedNetwork={isSupportedNetwork}
            todoCount={todoCount}
            liveActive={liveActive}
            onSwitchNetwork={switchNetwork}
            onDisconnect={disconnectWallet}
          />

          {!isSupportedNetwork && <NetworkWarning onSwitch={switchNetwork} />}

          <StatusBanner txStatus={txStatus} error={error} />

          {isSupportedNetwork && (
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
                {initialLoading && todos.length === 0 ? (
                  <TodoSkeleton count={3} />
                ) : (
                  <TodoList
                    todos={displayedTodos}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onShare={(id) => setShareId(id)}
                    onReorder={handleReorder}
                    reorderable={true}
                    loading={loading}
                  />
                )}
              </section>

              <TransactionHistory history={txHistory} onClear={clearHistory} />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
