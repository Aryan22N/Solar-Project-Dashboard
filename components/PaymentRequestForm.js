"use client";

import { useState, useEffect } from "react";

export default function PaymentRequestForm({ onSuccess }) {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [materials, setMaterials] = useState([{ name: "", quantity: "", unit_price: "" }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/projects")
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => console.error("Error fetching projects:", err));
    }, []);

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
                setMaterials([{ name: "", quantity: 1, unit_price: 0 }]);
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
                        color: "#000",          // text color
                        backgroundColor: "#fff" // optional for better visibility
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
                <label className="stat-label">Materials</label>
                {materials.map((m, index) => (
                    <div key={index} style={{ display: "flex", gap: "12px", marginBottom: "12px", alignItems: "center" }}>
                        <input
                            placeholder="Material Name"
                            className="input-field"
                            style={{ flex: 3 }}
                            value={m.name}
                            onChange={(e) => updateMaterial(index, "name", e.target.value)}
                        />
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
