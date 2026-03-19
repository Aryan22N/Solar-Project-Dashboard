"use client";

import { useState, useEffect, useRef } from "react";
import CameraCapture from "./CameraCapture";
import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";

export default function PaymentRequestForm({ onSuccess }) {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [materials, setMaterials] = useState([{ name: "", quantity: "", unit_price: "", image_url: "", image_file_id: "" }]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(null); // index of material being uploaded
    const [error, setError] = useState("");
    const [expenseHeads, setExpenseHeads] = useState([]);

    // Camera state
    const [showCamera, setShowCamera] = useState(false);
    const [activeMaterialIndex, setActiveMaterialIndex] = useState(null);
    const fileInputRef = useRef(null);



    useEffect(() => {
        fetch("/api/projects?status=ACTIVE")
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => console.error("Error fetching projects:", err));
    }, []);

    // Track previous project to avoid unnecessary resets
    const [prevProjectId, setPrevProjectId] = useState("");

    // When project changes, update expense heads
    useEffect(() => {
        if (selectedProject) {
            if (activeMaterialIndex === null) { // Only update heads if not currently interacting (minor safety)
            }
            const project = projects.find(p => p.id === parseInt(selectedProject));
            if (project && project.expense_heads && project.expense_heads.length > 0) {
                setExpenseHeads(project.expense_heads);
            } else {
                setExpenseHeads([]);
            }

            // Only reset materials if the project ID actually changed from its previous value
            if (selectedProject !== prevProjectId) {
                setMaterials([{ name: "", quantity: "", unit_price: "", image_url: "", image_file_id: "" }]);
                setPrevProjectId(selectedProject);
            }
        } else {
            setExpenseHeads([]);
            setPrevProjectId("");
        }
    }, [selectedProject, projects, prevProjectId]);

    const addMaterial = () => {
        setMaterials([...materials, { name: "", quantity: 1, unit_price: 0, image_url: "", image_file_id: "" }]);
    };

    const removeMaterial = (index) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const updateMaterial = (index, field, value) => {
        const newMaterials = [...materials];
        newMaterials[index][field] = value;
        setMaterials(newMaterials);
    };

    const authenticator = async () => {
        try {
            const response = await fetch("/api/upload-auth");
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Auth failed (${response.status}): ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Authenticator error:", error);
            throw new Error("Failed to authenticate for upload");
        }
    };

    const handleImageUpload = async (index, fileOrDataUrl) => {
        setUploading(index);
        setError("");

        try {
            // 1. Authenticate
            const authParams = await authenticator();
            console.log("Client-side Auth Params received:", authParams);
            const { signature, expire, token, publicKey, urlEndpoint } = authParams;

            // 2. Upload using @imagekit/next
            const uploadResult = await upload({
                file: fileOrDataUrl,
                fileName: `material_${Date.now()}.jpg`,
                folder: "/materials",
                signature,
                expire,
                token,
                publicKey,
                urlEndpoint,
                onProgress: (event) => {
                    // Optional: could add local progress state per material if needed
                    console.log(`Upload Progress: ${(event.loaded / event.total) * 100}%`);
                }
            });

            updateMaterial(index, "image_url", uploadResult.url);
            updateMaterial(index, "image_file_id", uploadResult.fileId);
        } catch (err) {
            console.error("Full Upload Error:", err);
            let errorMessage = "Failed to upload photo";
            
            if (err instanceof ImageKitAbortError) errorMessage = "Upload aborted";
            else if (err instanceof ImageKitInvalidRequestError) errorMessage = "Invalid upload request";
            else if (err instanceof ImageKitUploadNetworkError) errorMessage = "Network error during upload";
            else if (err instanceof ImageKitServerError) errorMessage = "ImageKit server error";
            else if (err.message) errorMessage = err.message;

            setError(`Upload Error: ${errorMessage}`);
        } finally {
            setUploading(null);
        }
    };

    const totalAmount = materials.reduce((sum, m) => sum + (m.quantity * (m.unit_price || 0)), 0);

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
                    materials: materials.map(m => ({
                        name: m.name,
                        quantity: m.quantity,
                        unit_price: m.unit_price,
                        image_url: m.image_url,
                        image_file_id: m.image_file_id
                    })),
                    total_amount: totalAmount
                })
            });

            if (response.ok) {
                setMaterials([{ name: "", quantity: 1, unit_price: 0, image_url: "", image_file_id: "" }]);
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
                <label className="stat-label">Expenses & Material Photos</label>
                {materials.map((m, index) => (
                    <div key={index} style={{ marginBottom: "16px", padding: "16px", background: "rgba(0,0,0,0.02)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", gap: "12px", marginBottom: "12px", alignItems: "center" }}>
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

                        {/* Image Upload/Capture Section */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {m.image_url ? (
                                <div style={{ position: "relative", width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
                                    <img src={m.image_url} alt="Material" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    <button
                                        type="button"
                                        onClick={() => updateMaterial(index, "image_url", "")}
                                        style={{ position: "absolute", top: 2, right: 2, background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: "16px", height: "16px", fontSize: "10px", cursor: "pointer" }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        type="button"
                                        className="btn-ghost"
                                        style={{ fontSize: "11px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px" }}
                                        onClick={() => {
                                            setActiveMaterialIndex(index);
                                            setShowCamera(true);
                                        }}
                                        disabled={uploading === index}
                                    >
                                        📷 {uploading === index ? "Uploading..." : "Capture Photo"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-ghost"
                                        style={{ fontSize: "11px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px" }}
                                        onClick={() => {
                                            setActiveMaterialIndex(index);
                                            fileInputRef.current?.click();
                                        }}
                                        disabled={uploading === index}
                                    >
                                        📁 Upload File
                                    </button>
                                </div>
                            )}
                            {uploading === index && <span className="spinner" style={{ width: "14px", height: "14px", borderTopColor: "var(--primary)" }}></span>}
                            {!m.image_url && <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>* Photo of material/receipt is recommended</span>}
                        </div>
                    </div>
                ))}

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                            handleImageUpload(activeMaterialIndex, e.target.files[0]);
                        }
                    }}
                />

                <button
                    type="button"
                    className="btn-ghost"
                    onClick={addMaterial}
                    style={{ width: "auto", fontSize: "12px" }}
                >
                    + Add More Expenses
                </button>
            </div>

            {showCamera && (
                <CameraCapture
                    onCapture={(dataUrl) => handleImageUpload(activeMaterialIndex, dataUrl)}
                    onClose={() => {
                        setShowCamera(false);
                        setActiveMaterialIndex(null);
                    }}
                />
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
