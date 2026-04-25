"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Toast from "@/components/Toast";
import ShimmerLoader from "@/components/ShimmerLoader";

export default function MembersPage() {
    const router = useRouter();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentMemberId, setCurrentMemberId] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        password: "",
        role: "PROJECT_MANAGER"
    });
    const [formLoading, setFormLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    const addToast = (title, message, type = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/members");
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            } else {
                addToast("Error", "Failed to load members", "error");
            }
        } catch (err) {
            console.error(err);
            addToast("Error", "Network error", "error");
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setCurrentMemberId(null);
        setFormData({ name: "", phone: "", password: "", role: "PROJECT_MANAGER" });
        setIsModalOpen(true);
    };

    const openEditModal = (member) => {
        setIsEditMode(true);
        setCurrentMemberId(member.id);
        setFormData({
            name: member.name || "",
            phone: member.phone || "",
            password: "", // Keep empty, only fill if changing
            role: member.role
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this member?")) return;

        try {
            const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
            if (res.ok) {
                addToast("Deleted", "Member removed successfully.");
                fetchMembers();
            } else {
                const data = await res.json();
                addToast("Error", data.error || "Failed to delete member", "error");
            }
        } catch (err) {
            console.error(err);
            addToast("Error", "Network error", "error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.phone || !formData.role) {
            addToast("Validation Error", "Phone and Role are required.", "error");
            return;
        }

        if (!isEditMode && !formData.password) {
            addToast("Validation Error", "Password is required for new members.", "error");
            return;
        }

        setFormLoading(true);
        try {
            // Format the date if it exists (convert YYYY-MM-DD to DDMMYYYY)
            let processedFormData = { ...formData };
            if (formData.password && formData.password.includes("-")) {
                const [year, month, day] = formData.password.split("-");
                processedFormData.password = `${day}${month}${year}`;
            }

            const url = isEditMode ? `/api/members/${currentMemberId}` : "/api/members";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(processedFormData)
            });

            if (res.ok) {
                addToast("Success", `Member ${isEditMode ? "updated" : "created"} successfully.`);
                setIsModalOpen(false);
                fetchMembers();
            } else {
                const data = await res.json();
                addToast("Error", data.error || `Failed to ${isEditMode ? "update" : "create"} member.`, "error");
            }
        } catch (err) {
            console.error(err);
            addToast("Error", "Network error", "error");
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh" }} className="responsive-root">
            <Toast toasts={toasts} />

            <div className="bg-mesh-custom" />
            <div className="orb1" />
            <div className="orb2" />

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? "open" : ""}`}>
                <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>✕</button>
                <div style={{ marginBottom: "24px", textAlign: "center" }}>
                    <div className="role-badge role-super" style={{ marginBottom: "12px" }}>⚡ Super Admin</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Control Center</div>
                </div>

                <Link href="/superadmin/dashboard" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                    <span>🏠</span> Dashboard
                </Link>

                <button className="mobile-menu-link" style={{ width: "100%", background: "rgba(248, 113, 113, 0.05)", borderColor: "rgba(248, 113, 113, 0.2)", color: "var(--danger)" }} onClick={handleLogout}>
                    <span>🚪</span> Sign Out
                </button>
            </div>

            {/* Header */}
            <header className="page-header">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Image src="/Logo_1.png" alt="Solar Logo" width={240} height={36} style={{ borderRadius: '8px' }} />
                </div>
                <div className="nav-desktop">
                    <Link href="/superadmin/dashboard" className="btn-ghost" style={{ textDecoration: "none", height: "36px", display: "inline-flex", alignItems: "center" }}>🏠 Dashboard</Link>
                    <span className="role-badge role-super" style={{ height: "36px", display: "inline-flex", alignItems: "center" }}>⚡ Super Admin</span>
                    <button className="btn-ghost" style={{ height: "36px", display: "inline-flex", alignItems: "center" }} onClick={handleLogout}>Sign Out</button>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor" />
                            <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" />
                            <rect x="3" y="13" width="14" height="2" rx="1" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="page-content">
                {loading ? (
                    <ShimmerLoader />
                ) : (
                    <>
                        <div className="fade-up" style={{ marginBottom: "36px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
                            <div>
                                <h1 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>
                                    👥 Manage Members
                                </h1>
                                <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
                                    Add or manage Managers and Supervisors in the system.
                                </p>
                            </div>
                            <button className="btn-primary" style={{ width: "auto" }} onClick={openCreateModal}>
                                + Add Member
                            </button>
                        </div>

                        <div className="glass-card fade-up" style={{ padding: "0", overflow: "hidden" }}>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
                                    <thead>
                                        <tr style={{ background: "rgba(15, 23, 42, 0.03)", borderBottom: "1px solid var(--border)" }}>
                                            <th style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>NAME</th>
                                            <th style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>PHONE (ID)</th>
                                            <th style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>ROLE</th>
                                            <th style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 600, textAlign: "right" }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                                                    No members found.
                                                </td>
                                            </tr>
                                        ) : (
                                            members.map(member => (
                                                <tr key={member.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                                    <td style={{ padding: "16px 24px", fontWeight: 600 }}>{member.name || "N/A"}</td>
                                                    <td style={{ padding: "16px 24px", color: "var(--text-muted)" }}>{member.phone}</td>
                                                    <td style={{ padding: "16px 24px" }}>
                                                        <span className={`role-badge ${member.role === 'PROJECT_MANAGER' ? 'role-manager' : 'role-supervisor'}`}>
                                                            {member.role === 'PROJECT_MANAGER' ? '📋 Manager' : '👷 Supervisor'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "16px 24px", textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                        <button
                                                            className="btn-ghost"
                                                            style={{ padding: "6px 12px", fontSize: "12px" }}
                                                            onClick={() => openEditModal(member)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn-ghost"
                                                            style={{ padding: "6px 12px", fontSize: "12px", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.2)" }}
                                                            onClick={() => handleDelete(member.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Add / Edit Member Modal */}
            {isModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <div className="glass-card fade-up" style={{ width: "100%", maxWidth: "500px", padding: "32px", background: "#fff" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>{isEditMode ? "Edit Member" : "Add New Member"}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label className="stat-label" style={{ display: "block", marginBottom: "8px" }}>Full Name (Optional)</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Enter member name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="stat-label" style={{ display: "block", marginBottom: "8px" }}>Phone Number *</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Enter login phone number"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        setFormData({ ...formData, phone: value });
                                    }}
                                    required
                                />
                            </div>

                            <div>
                                <label className="stat-label" style={{ display: "block", marginBottom: "8px" }}>
                                    Password (DOB) {isEditMode ? "(Leave blank to keep unchanged)" : "*"}
                                </label>
                                <input
                                    className="input-field"
                                    type="date"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!isEditMode}
                                />
                            </div>

                            <div>
                                <label className="stat-label" style={{ display: "block", marginBottom: "8px" }}>Role *</label>
                                <select
                                    className="input-field"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                >
                                    <option value="PROJECT_MANAGER">Project Manager (Approves Requests)</option>
                                    <option value="SUPERVISOR">Supervisor (Creates Requests)</option>
                                </select>
                            </div>

                            <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
                                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={formLoading}>
                                    {formLoading ? "Saving..." : "Save Member"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
