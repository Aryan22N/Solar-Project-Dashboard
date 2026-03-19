"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProjectProgress from "@/components/ProjectProgress";
import ShimmerLoader from "@/components/ShimmerLoader";

export default function ManagerProjectProgressPage() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/projects?status=ACTIVE")
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                if (data && data.length > 0) {
                    setSelectedProjectId(data[0].id);
                }
            })
            .catch(err => console.error(err))
            .finally(() => {
                setTimeout(() => setIsLoading(false), 600);
            });
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
                <Link href="/manager/dashboard" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                    <span>🏠</span> Dashboard
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
                    <Link href="/manager/dashboard" className="btn-ghost" style={{ textDecoration: "none" }}>🏠 Dashboard</Link>
                    <span className="role-badge role-manager">📋 Project Manager</span>
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
                            <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>Project Progress Tracking</h1>
                            <p style={{ color: "var(--text-muted)" }}>Monitor ongoing project milestones and updates.</p>
                        </div>

                        <div className="glass-card" style={{ padding: "24px", marginBottom: "32px" }}>
                            <div style={{ marginBottom: "0px" }}>
                                <label className="stat-label">Select Project to View/Track Progress</label>
                                <select 
                                    className="input-field" 
                                    style={{ maxWidth: "300px", marginTop: "8px" }}
                                    value={selectedProjectId || "all"}
                                    onChange={(e) => setSelectedProjectId(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                                >
                                    <option value="all">All Projects</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <ProjectProgress projectId={selectedProjectId} role="PROJECT_MANAGER" />
                    </div>
                )}
            </main>
        </div>
    );
}
