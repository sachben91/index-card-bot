import { useState, useEffect, useCallback } from 'react';
import IndexCard from './components/IndexCard.jsx';
import LoginModal from './components/LoginModal.jsx';

export default function App() {
  const [card, setCard] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const fetchCard = useCallback(async () => {
    setLoading(true);
    setEditing(false);
    try {
      const res = await fetch('/api/cards/random');
      const data = await res.json();
      setCard(data.card);
      setTotal(data.total);
      setAnimKey((k) => k + 1);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCard();
  }, [fetchCard]);

  useEffect(() => {
    if (!token) { setIsAdmin(false); return; }
    fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d.ok))
      .catch(() => setIsAdmin(false));
  }, [token]);

  function handleLogin(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setShowLogin(false);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
    setIsAdmin(false);
  }

  function handleEdit() {
    setEditText(card.text);
    setEditing(true);
  }

  async function handleSave() {
    const res = await fetch(`/api/cards/${card.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: editText }),
    });
    if (res.ok) {
      setCard((c) => ({ ...c, text: editText }));
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this card?')) return;
    const res = await fetch(`/api/cards/${card.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchCard();
  }

  return (
    <div className="app">
      <div className="top-bar">
        {isAdmin ? (
          <button className="login-btn" onClick={handleLogout}>logout</button>
        ) : (
          <button className="login-btn" onClick={() => setShowLogin(true)}>admin</button>
        )}
      </div>

      <IndexCard
        key={`${card?.id}-${animKey}`}
        card={card}
        loading={loading}
        isAdmin={isAdmin}
        editing={editing}
        editText={editText}
        onEditChange={setEditText}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
        onDelete={handleDelete}
      />

      <div className="controls">
        <button className="btn btn-primary" onClick={fetchCard} disabled={loading}>
          Shuffle
        </button>
        {total > 0 && <span className="card-count">{total} cards</span>}
      </div>

      {showLogin && <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
    </div>
  );
}
