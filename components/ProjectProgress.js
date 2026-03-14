"use client";

import { useState, useEffect } from "react";

export default function ProjectProgress({ projectId, role }) {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [percentage, setPercentage] = useState("");
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const isPM = role === "PROJECT_MANAGER";

    const fetchUpdates = async () => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/progress`);
            const data = await res.json();
            setUpdates(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUpdates();
    }, [projectId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!date) {
            setError("Date is required");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const url = editingId 
                ? `/api/projects/progress/${editingId}`
                : `/api/projects/${projectId}/progress`;
            
            const method = editingId ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ percentage, date, notes })
            });

            if (res.ok) {
                setPercentage("");
                setDate("");
                setNotes("");
                setEditingId(null);
                fetchUpdates();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to save update");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (update) => {
        setEditingId(update.id);
        setPercentage(update.percentage);
        setDate(update.date);
        setNotes(update.notes || "");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setPercentage("");
        setDate("");
        setNotes("");
        setError("");
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this progress update?")) return;
        
        try {
            const res = await fetch(`/api/projects/progress/${id}`, {
                method: "DELETE"
            });
            
            if (res.ok) {
                fetchUpdates();
            } else {
                setError("Failed to delete update");
            }
        } catch (err) {
            setError("An error occurred while deleting");
        }
    };

    if (!projectId) return null;

    return (
        <div className="fade-up-2">
            <h2 className="section-title">Project Progress</h2>

            {isPM && (
                <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
                    <h3 style={{ marginBottom: "16px", fontSize: "16px", fontWeight: 600 }}>
                        {editingId ? "Edit Progress Update" : "Add Progress Update"}
                    </h3>
                    
                    {error && <div className="alert-error" style={{ marginBottom: "16px" }}>{error}</div>}

                    <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 180px" }}>
                            <label className="stat-label">Date (Manual)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                placeholder="e.g. 14 March 2024"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label className="stat-label">Progress Percentage: {percentage}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={percentage || 0}
                            onChange={(e) => setPercentage(e.target.value)}
                            style={{ width: "100%", cursor: "pointer" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label className="stat-label">Progress Description / Notes</label>
                        <textarea
                            className="input-field"
                            style={{ minHeight: "80px", resize: "vertical" }}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Current status, milestones achieved..."
                        />
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                            type="submit" 
                            className="btn-primary" 
                            style={{ width: "auto", padding: "10px 24px" }}
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : (editingId ? "Update" : "Add Progress")}
                        </button>
                        {editingId && (
                            <button 
                                type="button" 
                                className="btn-ghost" 
                                onClick={cancelEdit}
                                style={{ padding: "10px 24px" }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}

            {loading ? (
                <div className="spinner" style={{ margin: "20px auto", display: "block" }}></div>
            ) : updates.length === 0 ? (
                <div className="glass-card" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                    No progress updates yet.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {updates.map((update) => (
                        <div key={update.id} className="glass-card" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)" }}>{update.percentage}%</span>
                                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>• {update.date}</span>
                                </div>
                                {update.notes && (
                                    <p style={{ fontSize: "14px", color: "var(--foreground)", opacity: 0.8, lineHeight: 1.5 }}>
                                        {update.notes}
                                    </p>
                                )}
                            </div>
                            {isPM && (
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button className="btn-ghost" onClick={() => startEdit(update)} style={{ fontSize: "12px", padding: "6px 12px" }}>
                                        Edit
                                    </button>
                                    <button className="btn-ghost" onClick={() => handleDelete(update.id)} style={{ fontSize: "12px", padding: "6px 12px", color: "var(--danger)" }}>
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
