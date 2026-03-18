"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import ProjectProgress from "@/components/ProjectProgress";
import ShimmerLoader from "@/components/ShimmerLoader";

export default function ProjectManagementPage() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("all");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/projects")
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => console.error(err))
    }, []);

    useEffect(() => {
        // Since Supervisor dashboard doesn't fetch main data here (it's in PaymentRequestForm),
        // we keep a small aesthetic timer but ensure success callback handles it
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
    };

    return (
        <div style={{ minHeight: "100vh" }} className="responsive-root">
            <div className="bg-mesh-custom" />
            <div className="orb1" />
            <div className="orb2" />

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? "open" : ""}`}>
                <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>✕</button>
                <Link href="/superadmin/dashboard" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                    <span>🏠</span> Dashboard
                </Link>
                <Link href="/superadmin/history" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                    <span>📜</span> Payment History
                </Link>
                <button className="mobile-menu-link" style={{ width: "100%", color: "var(--danger)" }} onClick={handleLogout}>
                    <span>🚪</span> Sign Out
                </button>
            </div>

            {/* Header */}
            <header className="page-header">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Image src="/Logo_1.png" alt="Solar Logo" width={240} height={36} style={{ borderRadius: '8px' }} />
                </div>

                <div className="nav-desktop">
                    <Link href="/superadmin/dashboard" className="btn-ghost" style={{ textDecoration: "none" }}>🏠 Dashboard</Link>
                    <Link href="/superadmin/history" className="btn-ghost" style={{ textDecoration: "none" }}>📜 History</Link>
                    <span className="role-badge role-super">⚡ Super Admin</span>
                    <button className="btn-ghost" onClick={handleLogout}>Sign Out</button>
                </div>

                <div className="mobile-only-btn">
                    <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="2" fill="currentColor" /><rect x="3" y="9" width="14" height="2" fill="currentColor" /><rect x="3" y="13" width="14" height="2" fill="currentColor" /></svg>
                    </button>
                </div>
            </header>

            <main className="page-content">
                {isLoading ? (
                    <ShimmerLoader />
                ) : (
                    <div className="fade-up">
                        <div style={{ marginBottom: "32px" }}>
                            <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>Project Management</h1>
                            <p style={{ color: "var(--text-muted)" }}>Track progress and finalize project lifecycles.</p>
                        </div>

                        <div className="glass-card" style={{ padding: "24px", marginBottom: "32px" }}>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: "200px" }}>
                                    <label className="stat-label">Select Project</label>
                                    <select
                                        className="input-field"
                                        style={{ marginTop: "8px" }}
                                        value={selectedProjectId || "all"}
                                        onChange={(e) => setSelectedProjectId(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                                    >
                                        <option value="all">All Projects</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} {p.status === "FINISHED" ? "(Finished)" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedProjectId && selectedProjectId !== "all" && projects.find(p => p.id === selectedProjectId)?.status !== "FINISHED" && (
                                    <button 
                                        className="btn-primary"
                                        style={{ height: "42px", width: "auto", padding: "0 24px", background: "var(--success)", borderColor: "var(--success)" }}
                                        onClick={async () => {
                                            if (confirm("Are you sure you want to finish this project? All current notes will be archived and the project status will be set to FINISHED.")) {
                                                try {
                                                    const res = await fetch(`/api/projects/${selectedProjectId}/finish`, { method: "POST" });
                                                    if (res.ok) {
                                                        alert("Project finished successfully!");
                                                        const freshProjects = await fetch("/api/projects").then(r => r.json());
                                                        setProjects(freshProjects);
                                                    } else {
                                                        const data = await res.json();
                                                        alert(data.error || "Failed to finish project");
                                                    }
                                                } catch (err) {
                                                    alert("An error occurred");
                                                }
                                            }
                                        }}
                                    >
                                        ✓ Finish Project
                                    </button>
                                )}
                            </div>
                        </div>

                        <ProjectProgress projectId={selectedProjectId} role="SUPER_ADMIN" />
                    </div>
                )}
            </main>
        </div>
    );
}
