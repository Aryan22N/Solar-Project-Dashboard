"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { upload } from "@imagekit/next";

export default function BillUploadForm({ onSuccess }) {
    const [name, setName] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [projects, setProjects] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadData, setUploadData] = useState({ url: "", fileId: "" });
    const [error, setError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [ikConfig, setIkConfig] = useState(null);

    useEffect(() => {
        fetch("/api/projects?status=ACTIVE")
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                if (data.length > 0) setSelectedProjectId(data[0].id);
            })
            .catch(err => console.error(err));
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setError("");
        setPreviewUrl(URL.createObjectURL(file));

        try {
            const authRes = await fetch("/api/upload-auth");
            if (!authRes.ok) throw new Error("Authentication failed");
            const { signature, expire, token, publicKey, urlEndpoint } = await authRes.json();

            const result = await upload({
                file,
                fileName: `bill_${Date.now()}.png`,
                publicKey,
                urlEndpoint,
                signature,
                expire,
                token
            });

            setUploadData({ url: result.url, fileId: result.fileId });
            setPreviewUrl(result.url);
        } catch (err) {
            console.error("Upload Error:", err);
            setError("Failed to upload image. Please try again.");
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !selectedProjectId || !uploadData.url) {
            setError("Please fill all fields and upload an image");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/bills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    project_id: selectedProjectId,
                    image_url: uploadData.url,
                    image_file_id: uploadData.fileId
                })
            });

            if (res.ok) {
                setShowSuccess(true);
                setName("");
                setPreviewUrl(null);
                setUploadData({ url: "", fileId: "" });
                setTimeout(() => {
                    setShowSuccess(false);
                    if (onSuccess) onSuccess();
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to save bill");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass-card fade-up" style={{ padding: "24px", marginBottom: "32px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>📤 Add Bill / Expense Image</h3>
            
            {showSuccess && (
                <div className="alert-success" style={{ marginBottom: "16px" }}>
                    ✅ Bill successfully uploaded and saved!
                </div>
            )}

            {error && (
                <div className="alert-error" style={{ marginBottom: "16px" }}>
                    ❌ {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 300px" }}>
                        <label className="stat-label">Project</label>
                        <select 
                            className="input-field"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            required
                        >
                            <option value="">Select Project</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div style={{ flex: "1 1 300px" }}>
                        <label className="stat-label">Description / Bill Name</label>
                        <input 
                            type="text" 
                            className="input-field"
                            placeholder="e.g. Site B - Transport Bill"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                    <label className="stat-label">Bill / QR Image</label>
                    <div style={{ 
                        marginTop: "8px", 
                        border: "2px dashed var(--border)", 
                        borderRadius: "12px", 
                        padding: "24px", 
                        textAlign: "center",
                        background: "rgba(255,255,255,0.4)"
                    }}>
                        {previewUrl ? (
                            <div style={{ position: "relative", width: "100%", maxWidth: "300px", margin: "0 auto" }}>
                                <Image 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    width={300} 
                                    height={200} 
                                    style={{ borderRadius: "10px", objectFit: "cover" }} 
                                />
                                <button 
                                    type="button"
                                    onClick={() => { setPreviewUrl(null); setUploadData({ url: "", fileId: "" }); }}
                                    style={{ 
                                        position: "absolute", 
                                        top: "-10px", 
                                        right: "-10px", 
                                        background: "var(--danger)", 
                                        color: "white", 
                                        border: "none", 
                                        borderRadius: "50%", 
                                        width: "24px", 
                                        height: "24px", 
                                        cursor: "pointer",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div style={{ position: "relative" }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleImageUpload}
                                    style={{ display: "none" }}
                                    id="bill-upload"
                                    disabled={isUploading}
                                />
                                <label htmlFor="bill-upload" className="btn-ghost" style={{ 
                                    cursor: isUploading ? "not-allowed" : "pointer", 
                                    display: "inline-flex", 
                                    alignItems: "center", 
                                    gap: "8px",
                                    padding: "12px 24px",
                                    opacity: isUploading ? 0.6 : 1
                                }}>
                                    {isUploading ? "⌛ Uploading..." : "📷 Choose Image / Take Photo"}
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isSubmitting || isUploading || !uploadData.url}
                    style={{ width: "100%", padding: "14px" }}
                >
                    {isSubmitting ? "⏳ Saving Bill..." : "✅ Save Bill / Expense"}
                </button>
            </form>
        </div>
    );
}
