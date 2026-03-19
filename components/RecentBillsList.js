"use client";

import { useState, useEffect } from "react";

export default function RecentBillsList({ refreshTrigger }) {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/bills")
            .then(res => res.json())
            .then(data => setBills(Array.isArray(data) ? data : []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [refreshTrigger]);

    const handleDelete = async (id) => {
        if (!confirm("Delete this bill?")) return;
        try {
            const res = await fetch(`/api/bills/${id}`, { method: "DELETE" });
            if (res.ok) setBills(prev => prev.filter(b => b.id !== id));
        } catch (err) { console.error(err); }
    };

    if (loading) return null;
    if (bills.length === 0) return null;

    return (
        <div className="fade-up" style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Your Recent Bills / QR</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                {bills.slice(0, 4).map(bill => (
                    <div key={bill.id} className="glass-card" style={{ padding: "12px", position: "relative" }}>
                        <img src={bill.image_url} alt={bill.name} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />
                        <div style={{ fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bill.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{bill.project?.name}</div>
                        <button 
                            onClick={() => handleDelete(bill.id)}
                            style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "none", borderRadius: "4px", padding: "2px 6px", fontSize: "10px", cursor: "pointer" }}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
