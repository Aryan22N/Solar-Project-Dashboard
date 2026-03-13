"use client";

import { useState, useEffect } from "react";

export default function PaymentRequestList({ refreshTrigger, role }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/payment-requests");
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [refreshTrigger]);

    const handleAction = async (id, action) => {
        try {
            const res = await fetch(`/api/payment-requests/${id}/${action}`, {
                method: "PATCH"
            });
            if (res.ok) {
                fetchRequests();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING_PM": return "#f59e0b";
            case "PENDING_ADMIN": return "#3b82f6";
            case "PAID": return "#10b981";
            case "REJECTED": return "#f87171";
            default: return "var(--text-muted)";
        }
    };

    if (loading) return <div className="spinner" style={{ margin: "20px auto", display: "block" }}></div>;

    if (requests.length === 0) {
        return (
            <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                No payment requests found.
            </div>
        );
    }

    return (
        <div className="fade-up-2">
            <h2 className="section-title">{role === "SUPERVISOR" ? "Recent Requests" : "Pending Approvals"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {requests.map((req) => (
                    <div key={req.id} className="glass-card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                <span style={{ fontWeight: 700, fontSize: "16px" }}>{req.project?.name}</span>
                                <span className="role-badge" style={{ background: `${getStatusColor(req.status)}20`, color: getStatusColor(req.status), border: `1px solid ${getStatusColor(req.status)}30` }}>
                                    {req.status.replace("_", " ")}
                                </span>
                            </div>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                Requested by: {req.supervisor?.name || "Self"} • {new Date(req.created_at).toLocaleDateString()}
                            </div>
                            <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {req.materials.map((m, i) => (
                                    <span key={i} style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>
                                        {m.name} (x{m.quantity})
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                            <div className="stat-value" style={{ fontSize: "20px", marginBottom: "12px" }}>
                                ₹{parseFloat(req.total_amount).toLocaleString()}
                            </div>
                            
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                {(role === "PROJECT_MANAGER" && req.status === "PENDING_PM") || (role === "SUPER_ADMIN" && req.status === "PENDING_ADMIN") ? (
                                    <>
                                        <button className="btn-ghost" onClick={() => handleAction(req.id, "reject")} style={{ color: "var(--danger)" }}>Reject</button>
                                        <button className="btn-primary" onClick={() => handleAction(req.id, "approve")} style={{ width: "auto", padding: "8px 20px" }}>Approve</button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
