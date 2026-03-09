"use client";

import { useRouter } from "next/navigation";

const actions = [
    {
        icon: "🏗️",
        iconBg: "rgba(245,158,11,0.12)",
        iconColor: "#f59e0b",
        title: "Create Project",
        desc: "Spin up a new solar installation project and assign the team.",
    },
    {
        icon: "👥",
        iconBg: "rgba(99,179,237,0.12)",
        iconColor: "#63b3ed",
        title: "Manage Users",
        desc: "Add, remove or update project managers and supervisors.",
    },
    {
        icon: "📊",
        iconBg: "rgba(129,140,248,0.12)",
        iconColor: "#818cf8",
        title: "View Reports",
        desc: "Access all project health, financials and audit reports.",
    },
    {
        icon: "⚙️",
        iconBg: "rgba(52,211,153,0.12)",
        iconColor: "#34d399",
        title: "System Settings",
        desc: "Configure global portal settings and permissions.",
    },
    {
        icon: "💰",
        iconBg: "rgba(248,113,113,0.12)",
        iconColor: "#f87171",
        title: "Budget Overview",
        desc: "Review total expenditure and budget allocation across all projects.",
    },
    {
        icon: "📋",
        iconBg: "rgba(167,139,250,0.12)",
        iconColor: "#a78bfa",
        title: "Audit Log",
        desc: "See a full log of user activity and system events.",
    },
];

const stats = [
    { value: "12", label: "Active Projects", color: "#f59e0b" },
    { value: "34", label: "Team Members", color: "#3b82f6" },
    { value: "₹4.2Cr", label: "Total Budget", color: "#34d399" },
    { value: "87%", label: "Completion Rate", color: "#818cf8" },
];

export default function SuperAdminDashboard() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
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
                    <span className="role-badge role-super">⚡ Super Admin</span>
                    <button className="btn-ghost" onClick={handleLogout}>Sign Out</button>
                </div>
            </header>

            <main className="page-content">

                {/* Welcome */}
                <div className="fade-up" style={{ marginBottom: "36px" }}>
                    <h1 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>
                        Good day, Admin 👋
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
                        Full platform access · All projects visible
                    </p>
                </div>



            </main>
        </div>
    );
}
