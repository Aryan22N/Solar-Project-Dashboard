"use client";

import { useState, useEffect } from "react";

export default function PaymentRequestForm({ onSuccess }) {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [materials, setMaterials] = useState([{ name: "", quantity: "", unit_price: "" }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expenseHeads, setExpenseHeads] = useState([]);

    // Progress & Notes state
    const [currentProgress, setCurrentProgress] = useState(0);
    const [progressNote, setProgressNote] = useState("");
    const [progressPercentage, setProgressPercentage] = useState("");
    const [savingProgress, setSavingProgress] = useState(false);
    const [progressSaved, setProgressSaved] = useState(false);

    useEffect(() => {
        fetch("/api/projects?status=ACTIVE")
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => console.error("Error fetching projects:", err));
    }, []);

    // When project changes, update expense heads and fetch progress
    useEffect(() => {
        if (selectedProject) {
            const project = projects.find(p => p.id === parseInt(selectedProject));
            if (project && project.expense_heads && project.expense_heads.length > 0) {
                setExpenseHeads(project.expense_heads);
            } else {
                setExpenseHeads([]);
            }
            setMaterials([{ name: "", quantity: "", unit_price: "" }]);

            // Fetch latest progress for this project
            fetch(`/api/projects/${selectedProject}/progress`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        setCurrentProgress(data[0].percentage || 0);
                    } else {
                        setCurrentProgress(0);
                    }
                })
                .catch(() => setCurrentProgress(0));

            setProgressNote("");
            setProgressPercentage("");
            setProgressSaved(false);
        } else {
            setExpenseHeads([]);
            setCurrentProgress(0);
            setProgressNote("");
            setProgressPercentage("");
        }
    }, [selectedProject, projects]);

    const addMaterial = () => {
        setMaterials([...materials, { name: "", quantity: 1, unit_price: 0 }]);
    };

    const removeMaterial = (index) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const updateMaterial = (index, field, value) => {
        const newMaterials = [...materials];
        newMaterials[index][field] = value;
        setMaterials(newMaterials);
    };

    const totalAmount = materials.reduce((sum, m) => sum + (m.quantity * m.unit_price), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProject) {
            setError("Please select a project");
            return;
        }
        if (materials.some(m => !m.name || m.unit_price <= 0)) {
            setError("Please fill all material details correctly");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/payment-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project_id: selectedProject,
                    materials,
                    total_amount: totalAmount
                })
            });

            if (response.ok) {
                // Auto-save progress & note if provided
                if (progressNote.trim() || progressPercentage) {
                    try {
                        const today = new Date();
                        const dateStr = today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
                        await fetch(`/api/projects/${selectedProject}/progress`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                percentage: progressPercentage || currentProgress,
                                date: dateStr,
                                notes: progressNote
                            })
                        });
                    } catch (err) {
                        console.error("Error saving progress:", err);
                    }
                }

                setMaterials([{ name: "", quantity: 1, unit_price: 0 }]);
                setProgressNote("");
                setProgressPercentage("");
                setSelectedProject("");
                onSuccess();
            } else {
                const data = await response.json();
                setError(data.error || "Failed to submit request");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (pct) => {
        if (pct >= 75) return "#10b981";
        if (pct >= 50) return "#3b82f6";
        if (pct >= 25) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card fade-up" style={{ padding: "32px", marginBottom: "32px" }}>
            <h2 className="section-title">New Payment Request</h2>

            {error && <div className="alert-error" style={{ marginBottom: "20px" }}>{error}</div>}

            <div style={{ marginBottom: "24px", color: "black" }}>
                <label className="stat-label">Project</label>

                <select
                    className="input-field"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    style={{
                        appearance: "none",
                        cursor: "pointer",
                        color: "#000",
                        backgroundColor: "#fff"
                    }}
                >
                    <option value="" style={{ color: "#555" }}>
                        Select Project
                    </option>

                    {projects.map((p) => (
                        <option key={p.id} value={p.id} style={{ color: "#000" }}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>



            <div style={{ marginBottom: "24px" }}>
                <label className="stat-label">Expenses</label>
                {materials.map((m, index) => (
                    <div key={index} style={{ display: "flex", gap: "12px", marginBottom: "12px", alignItems: "center" }}>
                        {expenseHeads.length > 0 ? (
                            <select
                                className="input-field"
                                style={{ flex: 3, color: "#000", backgroundColor: "#fff", appearance: "none", cursor: "pointer" }}
                                value={m.name}
                                onChange={(e) => updateMaterial(index, "name", e.target.value)}
                            >
                                <option value="" style={{ color: "#555" }}>Select Expense Head</option>
                                {expenseHeads.map((head) => (
                                    <option key={head} value={head} style={{ color: "#000" }}>
                                        {head}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                placeholder="Expense Name"
                                className="input-field"
                                style={{ flex: 3 }}
                                value={m.name}
                                onChange={(e) => updateMaterial(index, "name", e.target.value)}
                            />
                        )}
                        <input
                            type="number"
                            placeholder="Qty"
                            className="input-field"
                            style={{ flex: 1 }}
                            value={m.quantity}
                            onChange={(e) => updateMaterial(index, "quantity", e.target.value)}
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            className="input-field"
                            style={{ flex: 1.5 }}
                            value={m.unit_price}
                            onChange={(e) => updateMaterial(index, "unit_price", e.target.value)}
                        />
                        {materials.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeMaterial(index)}
                                style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "18px" }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    className="btn-ghost"
                    onClick={addMaterial}
                    style={{ width: "auto", fontSize: "12px" }}
                >
                    + Add More
                </button>
            </div>

            {/* Progress Bar & Notes — shown when project is selected */}
            {selectedProject && (
                <div style={{
                    marginBottom: "24px",
                    padding: "20px",
                    borderRadius: "14px",
                    background: "rgba(59,130,246,0.04)",
                    border: "1px solid rgba(59,130,246,0.1)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <label className="stat-label" style={{ margin: 0 }}>📊 Project Progress</label>
                        <span style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: getProgressColor(currentProgress)
                        }}>
                            {currentProgress}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                        width: "100%",
                        height: "10px",
                        borderRadius: "6px",
                        background: "rgba(0,0,0,0.06)",
                        overflow: "hidden",
                        marginBottom: "16px"
                    }}>
                        <div style={{
                            width: `${currentProgress}%`,
                            height: "100%",
                            borderRadius: "6px",
                            background: `linear-gradient(90deg, ${getProgressColor(currentProgress)}, ${getProgressColor(currentProgress)}dd)`,
                            transition: "width 0.6s ease"
                        }} />
                    </div>

                    {/* Update Progress */}
                    <div style={{ marginBottom: "12px" }}>
                        <label className="stat-label" style={{ fontSize: "12px" }}>Update Progress: {progressPercentage || currentProgress}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={progressPercentage || currentProgress}
                            onChange={(e) => setProgressPercentage(e.target.value)}
                            style={{ width: "100%", cursor: "pointer", accentColor: getProgressColor(progressPercentage || currentProgress) }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                        </div>
                    </div>

                    {/* Note input */}
                    <div style={{ marginBottom: "12px" }}>
                        <label className="stat-label" style={{ fontSize: "12px" }}>Add Note</label>
                        <textarea
                            className="input-field"
                            placeholder="Progress update, site notes, milestones..."
                            style={{ minHeight: "60px", resize: "vertical", fontSize: "13px" }}
                            value={progressNote}
                            onChange={(e) => setProgressNote(e.target.value)}
                        />
                    </div>


                </div>
            )}

            <div className="divider" />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <span className="stat-label">Total Amount</span>
                    <div className="stat-value" style={{ fontSize: "24px", color: "var(--accent)" }}>
                        ₹{totalAmount.toLocaleString()}
                    </div>
                </div>
                <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: "200px" }}
                    disabled={loading}
                >
                    {loading ? <span className="spinner"></span> : "Submit Request"}
                </button>
            </div>
        </form>
    );
}
