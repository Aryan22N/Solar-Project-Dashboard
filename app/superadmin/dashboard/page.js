"use client";

import { useRouter } from "next/navigation";
import PaymentRequestList from "@/components/PaymentRequestList";
import Link from "next/link";
import { useState } from "react";
import ProjectCreationModal from "@/components/ProjectCreationModal";

export default function SuperAdminDashboard() {
    const router = useRouter();
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
    };

    const handleProjectCreated = (newProject) => {
        console.log("Project created:", newProject);
        // Optionally refresh project lists if they exist
    };

    return (
        <div style={{ minHeight: "100vh" }}>
            <div className="bg-mesh" />

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? "open" : ""}`}>
                <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>✕</button>
                <div style={{ marginBottom: "24px", textAlign: "center" }}>
                    <div className="role-badge role-super" style={{ marginBottom: "12px" }}>⚡ Super Admin</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Control Center</div>
                </div>
                
                <Link href="/superadmin/history" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                    <span>📜</span> Payment History
                </Link>
                
                <button className="mobile-menu-link" style={{ width: "100%", background: "rgba(248, 113, 113, 0.05)", borderColor: "rgba(248, 113, 113, 0.2)", color: "var(--danger)" }} onClick={handleLogout}>
                    <span>🚪</span> Sign Out
                </button>
            </div>

            {/* Header */}
            <header className="page-header">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "22px" }}>☀️</span>
                    <span className="logo-text">Solar Portal</span>
                </div>
                
                <div className="nav-desktop">
                    <button 
                        className="btn-primary" 
                        style={{ 
                            padding: "8px 18px", 
                            fontSize: "13px", 
                            width: "auto", 
                            display: "inline-flex", 
                            alignItems: "center",
                            height: "36px"
                        }} 
                        onClick={() => setIsProjectModalOpen(true)}
                    >
                        + New Project
                    </button>
                    <Link href="/superadmin/history" className="btn-ghost" style={{ textDecoration: "none", height: "36px", display: "inline-flex", alignItems: "center" }}>📜 Payment History</Link>
                    <span className="role-badge role-super" style={{ height: "36px", display: "inline-flex", alignItems: "center" }}>⚡ Super Admin</span>
                    <button className="btn-ghost" style={{ height: "36px", display: "inline-flex", alignItems: "center" }} onClick={handleLogout}>Sign Out</button>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button 
                        className="btn-primary mobile-only-btn" 
                        style={{ 
                            padding: "6px 14px", 
                            fontSize: "12px", 
                            width: "auto", 
                            height: "36px",
                            display: "none" // Hidden on desktop via CSS eventually, but helper for mobile
                        }} 
                        onClick={() => setIsProjectModalOpen(true)}
                    >
                        + Project
                    </button>
                    <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor"/>
                            <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor"/>
                            <rect x="3" y="13" width="14" height="2" rx="1" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </header>

            <main className="page-content">

                {/* Welcome */}
                <div className="fade-up" style={{ marginBottom: "36px" }}>
                    <h1 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>
                        Good day, Admin 👋
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
                        Review approved requests and finalize payments below.
                    </p>
                </div>

                <PaymentRequestList role="SUPER_ADMIN" />

            </main>

            <ProjectCreationModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />
        </div>
    );
}
