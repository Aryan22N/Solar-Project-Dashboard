"use client";

import { useRouter } from "next/navigation";
import PaymentRequestList from "@/components/PaymentRequestList";
import Link from "next/link";
import { useState } from "react";
import ProjectCreationModal from "@/components/ProjectCreationModal";

export default function SuperAdminDashboard() {
    const router = useRouter();
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

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

            {/* Header */}
            <header className="page-header">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "22px" }}>☀️</span>
                    <span className="logo-text">Solar Portal</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
