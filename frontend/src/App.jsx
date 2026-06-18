import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './utils/contract';

function App() {
  const [account, setAccount] = useState('');
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState(0); // 0 = LOW, 1 = MEDIUM, 2 = HIGH
  const [shareTarget, setShareTarget] = useState({ id: null, address: '' });
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(''); 
  const [error, setError] = useState('');

  // 1. Koneksi ke MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Silakan instal ekstensi MetaMask terlebih dahulu!");
      return;
    }
    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setError('');
    } catch (err) {
      setError("Gagal terhubung ke MetaMask: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Mengambil data Todo (Read Operation)
  const fetchTodos = async () => {
    if (!window.ethereum || !account) return;
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const myTodoList = await contract.getTodos();
      setTodos(myTodoList);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setError("Gagal mengambil data dari blockchain.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      fetchTodos();
    }
  }, [account]);

  // 3. Menambah Todo Baru dengan 3 Parameter (Write Operation)
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      setLoading(true);
      setTxStatus('pending');
      setError('');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Konversi tanggal deadline ke Unix Timestamp (detik)
      const deadlineTimestamp = deadline ? Math.floor(new Date(deadline).getTime() / 1000) : 0;

      // Panggil fungsi dengan 3 parameter sesuai dengan berkas TodoList.sol
      const tx = await contract.addTodo(newTodo, deadlineTimestamp, priority);
      await tx.wait(); // Tunggu konfirmasi blok

      setTxStatus('success');
      setNewTodo('');
      setDeadline('');
      setPriority(0);
      await fetchTodos(); 
    } catch (err) {
      setTxStatus('failed');
      setError(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Menyelesaikan Todo (Write Operation)
  const handleCompleteTodo = async (id) => {
    try {
      setLoading(true);
      setTxStatus('pending');
      setError('');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.completeTodo(id);
      await tx.wait();

      setTxStatus('success');
      await fetchTodos();
    } catch (err) {
      setTxStatus('failed');
      setError(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Membagikan Todo (Write Operation)
  const handleShareTodo = async (e) => {
    e.preventDefault();
    if (!shareTarget.address || shareTarget.id === null) return;

    try {
      setLoading(true);
      setTxStatus('pending');
      setError('');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.shareTodo(shareTarget.id, shareTarget.address);
      await tx.wait();

      setTxStatus('success');
      setShareTarget({ id: null, address: '' });
      alert("Tugas berhasil dibagikan!");
      await fetchTodos();
    } catch (err) {
      setTxStatus('failed');
      setError(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk mengubah angka priority enum menjadi teks pembantu visual
  const getPriorityText = (p) => {
    if (Number(p) === 0) return 'LOW';
    if (Number(p) === 1) return 'MEDIUM';
    return 'HIGH';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '650px', margin: '0 auto' }}>
      <h1>📝 Blockchain To-Do List dApp</h1>
      
      {!account ? (
        <button onClick={connectWallet} disabled={loading} style={{ padding: '10px 20px', fontSize: '16px' }}>
          {loading ? 'Menghubungkan...' : 'Connect Wallet (MetaMask)'}
        </button>
      ) : (
        <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
          <p><strong>Dompet Terhubung:</strong> {account}</p>
        </div>
      )}

      {txStatus && <p style={{ color: txStatus === 'success' ? 'green' : txStatus === 'pending' ? 'orange' : 'red', fontWeight: 'bold' }}>
        Status Transaksi terakhir: {txStatus.toUpperCase()}
      </p>}
      {error && <p style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}

      {account && (
        <>
          {/* Form Tambah Tugas */}
          <form onSubmit={handleAddTodo} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '25px', border: '1px solid #ddd' }}>
            <h3>Tambah Tugas Baru</h3>
            <div style={{ marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="Isi aktivitas tugas..." 
                value={newTodo} 
                onChange={(e) => setNewTodo(e.target.value)}
                disabled={loading}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label><small>Deadline:</small></label>
                <input 
                  type="datetime-local" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{ width: '100%', padding: '6px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label><small>Prioritas:</small></label>
                <select value={priority} onChange={(e) => setPriority(Number(e.target.value))} style={{ width: '100%', padding: '6px' }}>
                  <option value={0}>LOW</option>
                  <option value={1}>MEDIUM</option>
                  <option value={2}>HIGH</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
              {loading && txStatus === 'pending' ? 'Memproses ke Blockchain...' : 'Simpan ke Blockchain'}
            </button>
          </form>

          {/* Daftar Semua Tugas */}
          <h2>Daftar Tugas Anda</h2>
          {todos.length === 0 ? <p style={{ color: '#777' }}>Belum ada tugas tercatat di alamat ini.</p> : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {todos.map((todo) => {
                const todoId = Number(todo.id);
                const isShared = todo.sharedBy !== "0x0000000000000000000000000000000000000000";
                return (
                  <li key={todoId} style={{ borderBottom: '1px solid #eee', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', fontWeight: 'bold', color: todo.completed ? '#aaa' : '#000' }}>
                        {todo.content}
                      </span>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        <span>Prioritas: <strong>{getPriorityText(todo.priority)}</strong></span>
                        {Number(todo.deadline) > 0 && (
                          <span style={{ marginLeft: '10px' }}>
                            Deadline: <strong>{new Date(Number(todo.deadline) * 1000).toLocaleString()}</strong>
                          </span>
                        )}
                        {isShared && (
                          <div style={{ color: '#0066cc', fontStyle: 'italic' }}>
                            Dibagikan oleh: {todo.sharedBy.substring(0,6)}...{todo.sharedBy.substring(38)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {!todo.completed && (
                        <button onClick={() => handleCompleteTodo(todoId)} disabled={loading} style={{ marginRight: '5px', padding: '5px 10px', background: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}>
                          Selesai
                        </button>
                      )}
                      <button onClick={() => setShareTarget({ id: todoId, address: '' })} disabled={loading} style={{ padding: '5px 10px' }}>
                        Bagikan
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Form Bagikan Tugas */}
          {shareTarget.id !== null && (
            <form onSubmit={handleShareTodo} style={{ background: '#eef4ff', padding: '15px', borderRadius: '5px', marginTop: '15px', border: '1px solid #bcc' }}>
              <h4>Bagikan Tugas (ID Kontrak: {shareTarget.id})</h4>
              <input 
                type="text" 
                placeholder="Masukkan Address Tujuan (0x...)" 
                value={shareTarget.address}
                onChange={(e) => setShareTarget({ ...shareTarget, address: e.target.value })}
                style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
                required
              />
              <div style={{ display: 'flex', gap: '5px' }}>
                <button type="submit" style={{ padding: '6px 12px', background: '#008CBA', color: 'white', border: 'none' }}>Kirim Tugas</button>
                <button type="button" onClick={() => setShareTarget({ id: null, address: '' })} style={{ padding: '6px 12px' }}>Batal</button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

export default App;