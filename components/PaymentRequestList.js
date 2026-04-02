"use client";

import { useState, useEffect, useRef } from "react";
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
    const [expandedNotes, setExpandedNotes] = useState({}); // { requestId: boolean }
    const [pmNotes, setPmNotes] = useState({}); // { requestId: string }
    const [savingNote, setSavingNote] = useState({}); // { requestId: boolean }
    const [previewImage, setPreviewImage] = useState(null); // URL of image to show in modal


    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/payment-requests");
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            // Add a small delay so the user can actually see the beautiful shimmer effect
            setTimeout(() => setLoading(false), 800);
        }
    };

    const initialSelectRef = useRef(false);

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            const projectList = Array.isArray(data) ? data : [];
            setProjects(projectList);
            if (projectList.length > 0 && selectedProjectId === null && !initialSelectRef.current) {
                setSelectedProjectId(projectList[0].id);
                initialSelectRef.current = true;
            }
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

    const handleAction = async (id, action, isClubbed = false, requestIds = [], projectId = null, currentPct = 0) => {
        // id is used for the key (e.g., 'group-1-date' for clubbed)
        const actionKey = `${id}-${action}`;
        const now = Date.now();
        const lastTime = lastActionTimes[actionKey] || 0;

        const body = {};


        // Cooldown check (5 seconds = 5000ms)
        if (now - lastTime < 5000) {
            console.log("Cooldown active for this action");
            addToast("Please Wait", "Please wait a moment before trying again.", "error");
            return;
        }

        // Prevent multiple actions on same request/group
        if (actionInProgress === id) {
            return;
        }

        // Auto-save note if present
        if (pmNotes[id]) {
            const success = await handleSavePMNote(id, projectId, currentPct, true);
            if (!success) {
                addToast("Note Failed", "Failed to save the note before approval. Action cancelled.", "error");
                return;
            }
        }

        setActionInProgress(id);

        try {
            // If clubbed, join IDs into a comma-separated string for the bulk-enabled APIs
            const targetId = isClubbed && requestIds.length > 0 ? requestIds.join(",") : id;
            const res = await fetch(`/api/payment-requests/${targetId}/${action}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setLastActionTimes(prev => ({ ...prev, [actionKey]: now }));

                // Optimistic update
                setRequests(prev => prev.filter(req => {
                    // Check both ID types for clubbed vs single
                    const groupKey = req.isClubbed ? `${req.project_id}-${new Date(req.created_at).toLocaleDateString("en-IN")}-${req.status}` : req.id;
                    return groupKey !== id;
                }));

                addToast(
                    action === "approve" ? "Request Approved ✓" : "Request Rejected ✗",
                    `The payment request ${isClubbed ? "group" : ""} has been ${action === "approve" ? "approved" : "rejected"}.`,
                    action === "approve" ? "success" : "error"
                );

                // Refresh list in background
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

    const getProgressColor = (pct) => {
        if (pct >= 75) return "#10b981";
        if (pct >= 50) return "#3b82f6";
        if (pct >= 25) return "#f59e0b";
        return "#ef4444";
    };

    const toggleNotes = (id) => {
        setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
    };



    const handleSavePMNote = async (requestId, projectId, currentPct, silent = false) => {
        const note = pmNotes[requestId];
        if (!note || !note.trim()) return true;

        if (!silent) setSavingNote(prev => ({ ...prev, [requestId]: true }));
        try {
            const today = new Date();
            const dateStr = today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

            const res = await fetch(`/api/projects/${projectId}/progress`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    percentage: currentPct,
                    date: dateStr,
                    notes: `[${role === "SUPER_ADMIN" ? "Admin" : "Manager"} Note] ${note}`
                })
            });

            if (res.ok) {
                if (!silent) addToast("Note Saved", "Your note has been added to the project progress.", "success");
                setPmNotes(prev => ({ ...prev, [requestId]: "" }));
                if (!silent) fetchRequests();
                return true;
            } else {
                if (!silent) addToast("Error", "Failed to save note.", "error");
                return false;
            }
        } catch (err) {
            console.error("Error saving PM note:", err);
            if (!silent) addToast("Error", "An unexpected error occurred.", "error");
            return false;
        } finally {
            if (!silent) setSavingNote(prev => ({ ...prev, [requestId]: false }));
        }
    };

    const filteredRequests = selectedProjectId && (role === "SUPER_ADMIN" || (showFilter && role === "SUPERVISOR"))
        ? requests.filter(req => req.project_id === selectedProjectId)
        : requests;

    // Apply limit for display (if not showing all)
    const displayedRequests = !showAll && limit ? filteredRequests.slice(0, limit) : filteredRequests;

    if (loading) {
        return (
            <div className="fade-up-2">
                <style>{`
                    @keyframes premium-shimmer-anim {
                        0% { background-position: -1000px 0; }
                        100% { background-position: 1000px 0; }
                    }
                    .premium-shimmer {
                        background: #f1f5f9;
                        background-image: linear-gradient(
                            to right,
                            #f1f5f9 0%,
                            #e2e8f0 20%,
                            #f1f5f9 40%,
                            #f1f5f9 100%
                        );
                        background-repeat: no-repeat;
                        background-size: 1000px 100%;
                        display: block;
                        position: relative;
                        animation: premium-shimmer-anim 2s linear infinite;
                    }
                `}</style>
                <h2 className="section-title">{role === "SUPERVISOR" ? "Recent Requests" : "Pending Approvals"}</h2>
                <div className="premium-shimmer" style={{ height: "400px", width: "100%", borderRadius: "20px", border: "1px solid #e2e8f0" }}></div>
            </div>
        );
    }

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
                        <div key={req.isClubbed ? `${req.project_id}-${req.created_at}-${req.status}` : req.id} className="glass-card" style={{ padding: "24px", paddingTop: req.isClubbed ? "12px" : "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", borderLeft: req.isClubbed ? "4px solid var(--primary)" : "none" }}>
                            <div style={{ flex: "1 1 300px", minWidth: "0" }}>
                                {req.isClubbed && (
                                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", letterSpacing: "0.5px", marginBottom: "8px" }}>
                                        📅 Day Summary • Grouped by Date
                                    </div>
                                )}
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 700, fontSize: "16px" }}>{req.project?.name}</span>
                                    <span className="role-badge" style={{ background: `${getStatusColor(req.status)}20`, color: getStatusColor(req.status), border: `1px solid ${getStatusColor(req.status)}30` }}>
                                        {(req.isClubbed && req.requestIds?.length > 1) ? `${req.status.replace("_", " ")} (ALL)` : req.status.replace("_", " ")}
                                    </span>
                                </div>
                                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                    {req.isClubbed ? "Requested by: " : "Requested by: "}{req.supervisor?.name || "Self"} • {new Date(req.created_at).toLocaleDateString()}
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
                                <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {req.materials.map((m, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", padding: "4px 10px", background: "rgba(15, 23, 42, 0.04)", borderRadius: "8px", color: "var(--text-muted)", border: "1px solid rgba(15, 23, 42, 0.05)" }}>
                                            <span>{m.name} (x{m.quantity})</span>
                                            {m.image_url && (
                                                <>
                                                    <button
                                                        onClick={() => setPreviewImage(m.image_url)}
                                                        style={{ border: "none", background: "rgba(59, 130, 246, 0.1)", color: "var(--primary)", padding: "2px 6px", borderRadius: "4px", cursor: "pointer", fontSize: "10px", fontWeight: "700" }}
                                                    >
                                                        📷 VIEW
                                                    </button>
                                                </>
                                            )}
                                        </div>
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
                                                onClick={() => {
                                                    const groupId = req.isClubbed ? `${req.project_id}-${new Date(req.created_at).toLocaleDateString("en-IN")}-${req.status}` : req.id;
                                                    handleAction(groupId, "reject", req.isClubbed, req.requestIds, req.project_id, req.progress.percentage);
                                                }}
                                                style={{
                                                    color: "#64748b",
                                                    flex: 1,
                                                    whiteSpace: "nowrap",
                                                    opacity: actionInProgress === (req.isClubbed ? `${req.project_id}-${new Date(req.created_at).toLocaleDateString("en-IN")}-${req.status}` : req.id) ? 0.5 : 1,
                                                    cursor: actionInProgress === (req.isClubbed ? `${req.project_id}-${new Date(req.created_at).toLocaleDateString("en-IN")}-${req.status}` : req.id) ? 'not-allowed' : 'pointer',
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
                                                disabled={actionInProgress === (req.isClubbed ? `${req.project_id}-${new Date(req.created_at).toLocaleDateString("en-IN")}-${req.status}` : req.id)}
                                            >
                                                {actionInProgress === (req.isClubbed ? `${req.project_id}-${new Date(req.created_at).toLocaleDateString("en-IN")}-${req.status}` : req.id) ? "Processing..." : (req.isClubbed && req.requestIds?.length > 1) ? "Reject All" : "Reject"}
                                            </button>
                                            <button
                                                className="btn-primary"
                                                onClick={() => {
                                                    const groupId = req.isClubbed ? `${req.project_id}-${new Date(req.created_at).toLocaleDateString("en-IN")}-${req.status}` : req.id;
                                                    handleAction(groupId, "approve", req.isClubbed, req.requestIds, req.project_id, req.progress.percentage);
                                                }}
                                                style={{
                                                    width: "auto",
                                                    padding: "8px 20px",
                                                    flex: 1,
                                                    whiteSpace: "nowrap",
                                                    opacity: actionInProgress === (req.isClubbed ? `${req.project_id}-${new Date(req.created_at).toLocaleDateString("en-IN")}-${req.status}` : req.id) ? 0.5 : 1,
                                                    cursor: actionInProgress === (req.isClubbed ? `${req.project_id}-${new Date(req.created_at).toLocaleDateString("en-IN")}-${req.status}` : req.id) ? 'not-allowed' : 'pointer'
                                                }}
                                                disabled={actionInProgress === (req.isClubbed ? `${req.project_id}-${new Date(req.created_at).toLocaleDateString("en-IN")}-${req.status}` : req.id)}
                                            >
                                                {actionInProgress === (req.isClubbed ? `${req.project_id}-${new Date(req.created_at).toLocaleDateString("en-IN")}-${req.status}` : req.id) ? "Processing..." : (req.isClubbed && req.requestIds?.length > 1) ? "Approve All" : "Approve"}
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
            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.8)",
                        backdropFilter: "blur(8px)",
                        zIndex: 2000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px"
                    }}
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        style={{ position: "relative", maxWidth: "90%", maxHeight: "90%", borderRadius: "16px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={previewImage} alt="Material Preview" style={{ maxWidth: "100%", maxHeight: "80vh", display: "block" }} />
                        <button
                            onClick={() => setPreviewImage(null)}
                            style={{
                                position: "absolute",
                                top: "15px",
                                right: "15px",
                                background: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: "32px",
                                height: "32px",
                                cursor: "pointer",
                                fontSize: "18px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                            }}
                        >
                            ✕
                        </button>
                        <div style={{ background: "#fff", padding: "12px 20px", fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                            Material Evidence / Receipt
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
