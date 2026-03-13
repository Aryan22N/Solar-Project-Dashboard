"use client";

import { useState } from "react";

export default function ProjectCreationModal({ isOpen, onClose, onProjectCreated }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, description }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create project");
            }

            const newProject = await response.json();
            setName("");
            setDescription("");
            onProjectCreated(newProject);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content fade-up" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: 700 }}>🏗️ Create New Project</h2>
                    <button className="btn-ghost" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>Project Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter project name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>Description (Optional)</label>
                        <textarea
                            className="input-field"
                            placeholder="Brief project overview..."
                            style={{ minHeight: "100px", resize: "vertical" }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                        <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                            {loading ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .modal-content {
                    background: var(--bg-card);
                    padding: 24px;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 450px;
                    border: 1px solid var(--border);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
                    backdrop-filter: blur(20px);
                }
                @media (min-width: 640px) {
                    .modal-content {
                        padding: 32px;
                    }
                }
            `}</style>
        </div>
    );
}
