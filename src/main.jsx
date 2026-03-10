import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "dukan_data";

const initialData = {
  customers: [],
  purchases: [],
};

function getAge(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatCurrency(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

const TABS = ["📋 Dashboard", "🛒 New Purchase", "👥 Customers", "🔔 Reminders"];

export default function DukanApp() {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState(null);
  const [reminderLog, setReminderLog] = useState([]);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const saved = await window.storage.get("dukan_data");
        if (saved) setData(JSON.parse(saved.value));
        const logs = await window.storage.get("dukan_reminders");
        if (logs) setReminderLog(JSON.parse(logs.value));
      } catch {}
    })();
  }, []);

  // Save to storage
  useEffect(() => {
    window.storage.set("dukan_data", JSON.stringify(data)).catch(() => {});
  }, [data]);

  useEffect(() => {
    window.storage.set("dukan_reminders", JSON.stringify(reminderLog)).catch(() => {});
  }, [reminderLog]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addCustomer = (name, phone) => {
    const id = Date.now().toString();
    setData(d => ({ ...d, customers: [...d.customers, { id, name, phone, createdAt: new Date().toISOString() }] }));
    showToast(`✅ ${name} added!`);
  };

  const addPurchase = (customerId, item, amount) => {
    const purchase = {
      id: Date.now().toString(),
      customerId,
      item,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      paid: false,
    };
    setData(d => ({ ...d, purchases: [...d.purchases, purchase] }));
    showToast("🛒 Purchase recorded!");
  };

  const markPaid = (purchaseId) => {
    setData(d => ({
      ...d,
      purchases: d.purchases.map(p => p.id === purchaseId ? { ...p, paid: true, paidAt: new Date().toISOString() } : p),
    }));
    showToast("💚 Marked as paid!");
  };

  const sendReminder = (customer, unpaid) => {
    const total = unpaid.reduce((s, p) => s + p.amount, 0);
    const log = {
      id: Date.now().toString(),
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      amount: total,
      sentAt: new Date().toISOString(),
      method: "broadcast",
    };
    setReminderLog(r => [log, ...r]);
    showToast(`📢 Reminder sent to ${customer.name} (${customer.phone})`, "info");
  };

  // Due customers (unpaid > 7 days)
  const dueCustomers = data.customers.map(c => {
    const unpaid = data.purchases.filter(p => p.customerId === c.id && !p.paid);
    const overdue = unpaid.filter(p => getAge(p.date) >= 7);
    const total = unpaid.reduce((s, p) => s + p.amount, 0);
    return { ...c, unpaid, overdue, total };
  }).filter(c => c.unpaid.length > 0);

  const overdueCustomers = dueCustomers.filter(c => c.overdue.length > 0);
  const totalDue = dueCustomers.reduce((s, c) => s + c.total, 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Poppins', sans-serif",
      color: "#fff",
      paddingBottom: 80,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: "linear-gradient(135deg, #f7971e, #ffd200)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 800, color: "#1a1a2e",
        }}>🏪</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.5 }}>DukanBook</div>
          <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 300 }}>Local Shop Credit Manager</div>
        </div>
        {overdueCustomers.length > 0 && (
          <div style={{
            marginLeft: "auto",
            background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
            borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700,
            animation: "pulse 2s infinite",
          }}>
            🔔 {overdueCustomers.length} Overdue
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
        @keyframes slideIn { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .card { animation: slideIn 0.3s ease forwards; }
        .btn { transition: all 0.2s; cursor: pointer; }
        .btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .btn:active { transform: scale(0.97); }
        input, select { outline: none; }
        input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "info" ? "linear-gradient(135deg,#4facfe,#00f2fe)" : "linear-gradient(135deg,#43e97b,#38f9d7)",
          color: "#1a1a2e", padding: "10px 20px", borderRadius: 30,
          fontWeight: 700, fontSize: 13, zIndex: 999,
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          animation: "slideIn 0.3s ease",
        }}>{toast.msg}</div>
      )}

      <div style={{ padding: "0 16px", maxWidth: 480, margin: "0 auto" }}>

        {/* Tab 0: Dashboard */}
        {tab === 0 && (
          <div style={{ paddingTop: 20 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Total Due", value: formatCurrency(totalDue), icon: "💰", grad: "linear-gradient(135deg,#f7971e,#ffd200)", dark: "#1a1a2e" },
                { label: "Customers Owing", value: dueCustomers.length, icon: "👤", grad: "linear-gradient(135deg,#4facfe,#00f2fe)", dark: "#1a1a2e" },
                { label: "Overdue (7d+)", value: overdueCustomers.length, icon: "⚠️", grad: "linear-gradient(135deg,#ff416c,#ff4b2b)", dark: "#fff" },
                { label: "Reminders Sent", value: reminderLog.length, icon: "📢", grad: "linear-gradient(135deg,#a18cd1,#fbc2eb)", dark: "#1a1a2e" },
              ].map((s, i) => (
                <div key={i} className="card" style={{
                  background: s.grad, borderRadius: 16, padding: "16px",
                  color: s.dark, animationDelay: `${i * 0.05}s`,
                }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Overdue alerts */}
            {overdueCustomers.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  🚨 Overdue Payments
                </div>
                {overdueCustomers.map(c => (
                  <div key={c.id} className="card" style={{
                    background: "rgba(255,65,108,0.15)",
                    border: "1px solid rgba(255,65,108,0.4)",
                    borderRadius: 14, padding: 14, marginBottom: 10,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{c.phone} • {c.overdue.length} overdue item{c.overdue.length > 1 ? "s" : ""}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#ff6b6b", marginTop: 2 }}>{formatCurrency(c.total)}</div>
                    </div>
                    <button className="btn" onClick={() => sendReminder(c, c.unpaid)} style={{
                      background: "linear-gradient(135deg,#ff416c,#ff4b2b)",
                      border: "none", borderRadius: 10, color: "#fff",
                      padding: "8px 14px", fontSize: 12, fontWeight: 700,
                    }}>📢 Remind</button>
                  </div>
                ))}
              </div>
            )}

            {/* All due list */}
            {dueCustomers.length === 0 ? (
              <div style={{ textAlign: "center", opacity: 0.5, marginTop: 60 }}>
                <div style={{ fontSize: 48 }}>🎉</div>
                <div style={{ fontWeight: 600, marginTop: 8 }}>No pending dues!</div>
                <div style={{ fontSize: 13 }}>All customers are clear.</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  📋 All Pending
                </div>
                {dueCustomers.map(c => (
                  <div key={c.id} className="card" style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 14, padding: 14, marginBottom: 10,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: 12, opacity: 0.6 }}>{c.phone}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#ffd200" }}>{formatCurrency(c.total)}</div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      {c.unpaid.map(p => (
                        <div key={p.id} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
                          fontSize: 13,
                        }}>
                          <div>
                            <span>{p.item}</span>
                            <span style={{
                              marginLeft: 8, fontSize: 11,
                              color: getAge(p.date) >= 7 ? "#ff6b6b" : "#aaa",
                              fontWeight: 600,
                            }}>
                              {getAge(p.date) >= 7 ? `⚠️ ${getAge(p.date)}d ago` : `${getAge(p.date)}d ago`}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700 }}>{formatCurrency(p.amount)}</span>
                            <button className="btn" onClick={() => markPaid(p.id)} style={{
                              background: "linear-gradient(135deg,#43e97b,#38f9d7)",
                              border: "none", borderRadius: 8, color: "#1a1a2e",
                              padding: "4px 10px", fontSize: 11, fontWeight: 700,
                            }}>✓ Paid</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: New Purchase */}
        {tab === 1 && (
          <PurchaseForm customers={data.customers} onAdd={addPurchase} onAddCustomer={addCustomer} showToast={showToast} />
        )}

        {/* Tab 2: Customers */}
        {tab === 2 && (
          <CustomersTab customers={data.customers} purchases={data.purchases} onAdd={addCustomer} markPaid={markPaid} />
        )}

        {/* Tab 3: Reminders */}
        {tab === 3 && (
          <RemindersTab log={reminderLog} overdueCustomers={overdueCustomers} sendReminder={sendReminder} />
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(15,12,41,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 14px",
        zIndex: 100,
      }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            background: "none", border: "none", color: tab === i ? "#ffd200" : "rgba(255,255,255,0.4)",
            fontSize: tab === i ? 11 : 10, fontWeight: tab === i ? 700 : 400,
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 2, transition: "all 0.2s",
            transform: tab === i ? "translateY(-2px)" : "none",
            fontFamily: "'Poppins', sans-serif",
          }}>
            <span style={{ fontSize: 20 }}>{t.split(" ")[0]}</span>
            <span>{t.split(" ").slice(1).join(" ")}</span>
            {i === 3 && overdueCustomers.length > 0 && (
              <span style={{
                position: "absolute", top: 6,
                background: "#ff416c", borderRadius: "50%",
                width: 8, height: 8,
              }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function PurchaseForm({ customers, onAdd, onAddCustomer, showToast }) {
  const [mode, setMode] = useState("existing"); // existing | new
  const [custId, setCustId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");

  const handle = () => {
    if (!item || !amount) return showToast("⚠️ Fill item & amount", "info");
    if (mode === "existing") {
      if (!custId) return showToast("⚠️ Select a customer", "info");
      onAdd(custId, item, amount);
    } else {
      if (!name || !phone) return showToast("⚠️ Fill name & phone", "info");
      const id = Date.now().toString();
      onAddCustomer(name, phone);
      setTimeout(() => onAdd(id, item, amount), 50);
    }
    setItem(""); setAmount(""); setName(""); setPhone(""); setCustId("");
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12,
    padding: "13px 16px", color: "#fff", fontSize: 14,
    fontFamily: "'Poppins', sans-serif", boxSizing: "border-box",
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 20 }}>🛒 Record Purchase</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["existing", "new"].map(m => (
          <button key={m} className="btn" onClick={() => setMode(m)} style={{
            flex: 1, padding: "10px", borderRadius: 12, fontWeight: 700,
            border: "none", cursor: "pointer", fontSize: 13,
            fontFamily: "'Poppins', sans-serif",
            background: mode === m ? "linear-gradient(135deg,#f7971e,#ffd200)" : "rgba(255,255,255,0.08)",
            color: mode === m ? "#1a1a2e" : "#fff",
          }}>
            {m === "existing" ? "👤 Existing Customer" : "➕ New Customer"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "existing" ? (
          <select value={custId} onChange={e => setCustId(e.target.value)} style={{ ...inputStyle }}>
            <option value="">-- Select Customer --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
          </select>
        ) : (
          <>
            <input placeholder="Customer Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            <input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} type="tel" />
          </>
        )}
        <input placeholder="Item / Product name" value={item} onChange={e => setItem(e.target.value)} style={inputStyle} />
        <input placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} type="number" />
        <button className="btn" onClick={handle} style={{
          background: "linear-gradient(135deg,#f7971e,#ffd200)",
          border: "none", borderRadius: 14, padding: "14px",
          fontWeight: 800, fontSize: 15, color: "#1a1a2e",
          cursor: "pointer", fontFamily: "'Poppins', sans-serif",
          boxShadow: "0 4px 20px rgba(247,151,30,0.4)",
        }}>
          💾 Save Purchase (Udhar)
        </button>
      </div>
    </div>
  );
}

function CustomersTab({ customers, purchases, onAdd, markPaid }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12,
    padding: "12px 16px", color: "#fff", fontSize: 14,
    fontFamily: "'Poppins', sans-serif", boxSizing: "border-box",
  };

  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>👥 Customers</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, flex: 1 }} type="tel" />
        <button className="btn" onClick={() => { if (name && phone) { onAdd(name, phone); setName(""); setPhone(""); } }} style={{
          background: "linear-gradient(135deg,#43e97b,#38f9d7)", border: "none", borderRadius: 12,
          padding: "0 16px", fontWeight: 800, color: "#1a1a2e", cursor: "pointer", fontSize: 18,
        }}>+</button>
      </div>

      <input placeholder="🔍 Search customers..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", opacity: 0.4, marginTop: 40 }}>No customers yet</div>
      ) : filtered.map(c => {
        const cp = purchases.filter(p => p.customerId === c.id);
        const unpaid = cp.filter(p => !p.paid);
        const total = unpaid.reduce((s, p) => s + p.amount, 0);
        return (
          <div key={c.id} className="card" style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14, padding: 14, marginBottom: 10,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>📞 {c.phone}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {unpaid.length > 0
                    ? <span style={{ color: "#ff6b6b", fontWeight: 700 }}>{formatCurrency(total)} due ({unpaid.length} items)</span>
                    : <span style={{ color: "#43e97b", fontWeight: 600 }}>✓ All clear</span>}
                </div>
              </div>
              <div style={{ fontSize: 11, opacity: 0.5 }}>
                {cp.length} purchase{cp.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RemindersTab({ log, overdueCustomers, sendReminder }) {
  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>🔔 Reminders</div>

      {overdueCustomers.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Send Broadcast Reminders
          </div>
          <button className="btn" onClick={() => overdueCustomers.forEach(c => sendReminder(c, c.unpaid))} style={{
            width: "100%", background: "linear-gradient(135deg,#ff416c,#ff4b2b)",
            border: "none", borderRadius: 14, padding: "14px",
            fontWeight: 800, fontSize: 15, color: "#fff", cursor: "pointer",
            fontFamily: "'Poppins', sans-serif",
            boxShadow: "0 4px 20px rgba(255,65,108,0.4)",
            marginBottom: 10,
          }}>
            📢 Broadcast Reminder to All {overdueCustomers.length} Overdue
          </button>

          {overdueCustomers.map(c => (
            <div key={c.id} style={{
              background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12,
              marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>{c.phone}</div>
                <div style={{ fontSize: 13, color: "#ffd200", fontWeight: 700 }}>{formatCurrency(c.total)}</div>
              </div>
              <button className="btn" onClick={() => sendReminder(c, c.unpaid)} style={{
                background: "linear-gradient(135deg,#4facfe,#00f2fe)", border: "none",
                borderRadius: 10, padding: "8px 14px", color: "#1a1a2e",
                fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins', sans-serif",
              }}>📲 Send</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
        Reminder History
      </div>
      {log.length === 0 ? (
        <div style={{ textAlign: "center", opacity: 0.4, marginTop: 30 }}>No reminders sent yet</div>
      ) : log.map(r => (
        <div key={r.id} style={{
          background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 12, marginBottom: 8,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>📢 {r.customerName}</div>
            <div style={{ fontSize: 12, color: "#ffd200", fontWeight: 700 }}>{formatCurrency(r.amount)}</div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>{r.phone}</div>
          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
            Sent: {new Date(r.sentAt).toLocaleString("en-IN")}
          </div>
        </div>
      ))}
    </div>
  );
}