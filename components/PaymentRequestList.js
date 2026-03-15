"use client";

import { useState, useEffect } from "react";
import Toast from "./Toast";

export default function PaymentRequestList({ refreshTrigger, role, limit = null, showFilter = false }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);
    const [lastActionTimes, setLastActionTimes] = useState({}); // { "id-action": timestamp }
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(null); // Track which request is being processed
    const [showAll, setShowAll] = useState(false); // For "View More" functionality

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

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRequests();
        if (role === "SUPER_ADMIN" || (showFilter && role === "SUPERVISOR")) {
            fetchProjects();
        }
    }, [refreshTrigger, role, showFilter]);

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

        // Cooldown check (5 seconds = 5000ms) - reduced from 35s
        if (now - lastTime < 5000) {
            console.log("Cooldown active for this action");
            addToast("Please Wait", "Please wait a moment before trying again.", "error");
            return;
        }

        // Prevent multiple actions on same request
        if (actionInProgress === id) {
            return;
        }

        setActionInProgress(id);

        try {
            const res = await fetch(`/api/payment-requests/${id}/${action}`, {
                method: "PATCH"
            });
            
            if (res.ok) {
                setLastActionTimes(prev => ({ ...prev, [actionKey]: now }));
                
                // Optimistic update - remove/update the request in the list immediately
                setRequests(prev => prev.filter(req => req.id !== id));
                
                addToast(
                    action === "approve" ? "Request Approved ✓" : "Request Rejected ✗",
                    `The payment request has been ${action === "approve" ? "approved" : "rejected"}.`,
                    action === "approve" ? "success" : "error"
                );
                
                // Refresh list in background (debounced)
                setTimeout(() => fetchRequests(), 1000);
            } else {
                addToast("Action Failed", "Something went wrong while processing the request.", "error");
            }
        } catch (err) {
            console.error(err);
            addToast("Network Error", "Unable to connect to the server.", "error");
        } finally {
            setActionInProgress(null);
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

    const filteredRequests = selectedProjectId && (role === "SUPER_ADMIN" || (showFilter && role === "SUPERVISOR"))
        ? requests.filter(req => req.project_id === selectedProjectId)
        : requests;

    // Apply limit for display (if not showing all)
    const displayedRequests = !showAll && limit ? filteredRequests.slice(0, limit) : filteredRequests;

    if (loading) return <div className="spinner" style={{ margin: "20px auto", display: "block" }}></div>;

    return (
        <div className="fade-up-2">
            <Toast toasts={toasts} />
            <h2 className="section-title">{role === "SUPERVISOR" ? "Recent Requests" : "Pending Approvals"}</h2>
            
            {(role === "SUPER_ADMIN" || (showFilter && role === "SUPERVISOR")) && (
                <div style={{ marginBottom: "20px" }}>
                    <label className="stat-label">Filter by Project</label>
                    <select 
                        className="input-field" 
                        style={{ maxWidth: "300px", marginTop: "8px" }}
                        value={selectedProjectId || ""}
                        onChange={(e) => setSelectedProjectId(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}
            
            {filteredRequests.length === 0 ? (
                <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    {(role === "SUPER_ADMIN" || (showFilter && role === "SUPERVISOR")) && selectedProjectId 
                        ? "No payment requests found for this project." 
                        : "No payment requests found."}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {displayedRequests.map((req) => (
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
                                {req.status === "REJECTED" && req.pm?.name && (
                                    <div style={{ marginTop: "4px", color: "#f87171", fontSize: "12px", fontWeight: 500 }}>
                                        ❌ Rejected by: {req.pm.name}
                                    </div>
                                )}
                                {req.status === "PAID" && req.pm?.name && (
                                    <div style={{ marginTop: "4px", color: "#10b981", fontSize: "12px", fontWeight: 500 }}>
                                        ✓ Approved by: {req.pm.name}
                                    </div>
                                )}
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
                                        <button 
                                            className="btn-ghost" 
                                            onClick={() => handleAction(req.id, "reject")} 
                                            style={{ 
                                                color: "#64748b", 
                                                flex: 1, 
                                                whiteSpace: "nowrap",
                                                opacity: actionInProgress === req.id ? 0.5 : 1,
                                                cursor: actionInProgress === req.id ? 'not-allowed' : 'pointer',
                                                border: '1px solid var(--border)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = '#f1f5f9';
                                                e.target.style.borderColor = '#cbd5e1';
                                                e.target.style.color = '#475569';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'transparent';
                                                e.target.style.borderColor = 'var(--border)';
                                                e.target.style.color = '#64748b';
                                            }}
                                            disabled={actionInProgress === req.id}
                                        >
                                            {actionInProgress === req.id ? "Processing..." : "Reject"}
                                        </button>
                                        <button 
                                            className="btn-primary" 
                                            onClick={() => handleAction(req.id, "approve")} 
                                            style={{ 
                                                width: "auto", 
                                                padding: "8px 20px", 
                                                flex: 1, 
                                                whiteSpace: "nowrap",
                                                opacity: actionInProgress === req.id ? 0.5 : 1,
                                                cursor: actionInProgress === req.id ? 'not-allowed' : 'pointer'
                                            }}
                                            disabled={actionInProgress === req.id}
                                        >
                                            {actionInProgress === req.id ? "Processing..." : "Approve"}
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            )}
            
            {/* View More Button for Supervisors */}
            {showFilter && role === "SUPERVISOR" && filteredRequests.length > (limit || 3) && !showAll && (
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <button 
                        className="btn-ghost" 
                        onClick={() => setShowAll(true)}
                        style={{ 
                            padding: "10px 32px", 
                            fontSize: "14px",
                            fontWeight: 600,
                            textDecoration: "underline",
                            textUnderlineOffset: "4px"
                        }}
                    >
                        View More ({filteredRequests.length - (limit || 3)} more)
                    </button>
                </div>
            )}
            
            {/* View All Button for Super Admin */}
            {role === "SUPER_ADMIN" && filteredRequests.length > 3 && !showAll && (
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <button 
                        className="btn-ghost" 
                        onClick={() => setShowAll(true)}
                        style={{ 
                            padding: "10px 32px", 
                            fontSize: "14px",
                            fontWeight: 600,
                            textDecoration: "underline",
                            textUnderlineOffset: "4px"
                        }}
                    >
                        View All ({filteredRequests.length - 3} more requests)
                    </button>
                </div>
            )}
        </div>
    );
}
