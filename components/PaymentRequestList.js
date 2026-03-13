"use client";

import { useState, useEffect } from "react";
import Toast from "./Toast";

export default function PaymentRequestList({ refreshTrigger, role }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);
    const [lastActionTimes, setLastActionTimes] = useState({}); // { "id-action": timestamp }

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

    const addToast = (title, message, type = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const handleAction = async (id, action) => {
        const actionKey = `${id}-${action}`;
        const now = Date.now();
        const lastTime = lastActionTimes[actionKey] || 0;

        // Cooldown check (35 seconds = 35000ms)
        if (now - lastTime < 35000) {
            console.log("Cooldown active for this action");
            return;
        }

        try {
            const res = await fetch(`/api/payment-requests/${id}/${action}`, {
                method: "PATCH"
            });
            if (res.ok) {
                setLastActionTimes(prev => ({ ...prev, [actionKey]: now }));
                addToast(
                    action === "approve" ? "Request Approved" : "Request Rejected",
                    `The payment request for project has been ${action === "approve" ? "approved" : "rejected"}.`,
                    action === "approve" ? "success" : "error"
                );
                fetchRequests();
            } else {
                addToast("Action Failed", "Something went wrong while processing the request.", "error");
            }
        } catch (err) {
            console.error(err);
            addToast("Network Error", "Unable to connect to the server.", "error");
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
            <Toast toasts={toasts} />
            <h2 className="section-title">{role === "SUPERVISOR" ? "Recent Requests" : "Pending Approvals"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {requests.map((req) => (
                    <div key={req.id} className="glass-card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
                        <div style={{ flex: "1 1 300px", minWidth: "0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
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
                                    <span key={i} style={{ fontSize: "11px", padding: "4px 10px", background: "rgba(15, 23, 42, 0.04)", borderRadius: "6px", color: "var(--text-muted)", border: "1px solid rgba(15, 23, 42, 0.05)" }}>
                                        {m.name} (x{m.quantity})
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ textAlign: "right", flex: "1 1 100%", smFlex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <div className="stat-value" style={{ fontSize: "20px", marginBottom: "12px" }}>
                                ₹{parseFloat(req.total_amount).toLocaleString()}
                            </div>

                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", width: "100%" }}>
                                {(role === "PROJECT_MANAGER" && req.status === "PENDING_PM") || (role === "SUPER_ADMIN" && req.status === "PENDING_ADMIN") ? (
                                    <>
                                        <button className="btn-ghost" onClick={() => handleAction(req.id, "reject")} style={{ color: "var(--danger)", flex: 1, whiteSpace: "nowrap" }}>Reject</button>
                                        <button className="btn-primary" onClick={() => handleAction(req.id, "approve")} style={{ width: "auto", padding: "8px 20px", flex: 1, whiteSpace: "nowrap" }}>Approve</button>
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
