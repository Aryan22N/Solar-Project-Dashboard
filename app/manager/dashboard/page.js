"use client";

import { useRouter } from "next/navigation";

const actions = [
    {
        icon: "✅",
        iconBg: "rgba(59,130,246,0.12)",
        iconColor: "#3b82f6",
        title: "Manage Tasks",
        desc: "View, create and update tasks for your active project.",
    },
    {
        icon: "👷",
        iconBg: "rgba(52,211,153,0.12)",
        iconColor: "#34d399",
        title: "Assign Supervisors",
        desc: "Assign supervisors to specific site tasks and milestones.",
    },
    {
        icon: "🗂️",
        iconBg: "rgba(129,140,248,0.12)",
        iconColor: "#818cf8",
        title: "View Project",
        desc: "See full project timeline, milestones and deliverables.",
    },
    {
        icon: "📅",
        iconBg: "rgba(245,158,11,0.12)",
        iconColor: "#f59e0b",
        title: "Schedule Meeting",
        desc: "Schedule a team sync or client meeting from the calendar.",
    },
    {
        icon: "📈",
        iconBg: "rgba(248,113,113,0.12)",
        iconColor: "#f87171",
        title: "Progress Report",
        desc: "Generate a progress summary report for this week.",
    },
    {
        icon: "💬",
        iconBg: "rgba(167,139,250,0.12)",
        iconColor: "#a78bfa",
        title: "Team Chat",
        desc: "Send messages and updates to your project team.",
    },
];

const stats = [
    { value: "3", label: "Active Projects", color: "#3b82f6" },
    { value: "8", label: "Supervisors", color: "#34d399" },
    { value: "24", label: "Open Tasks", color: "#f59e0b" },
    { value: "72%", label: "On Track", color: "#818cf8" },
];

export default function ManagerDashboard() {
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
                    <span className="role-badge role-manager">📋 Project Manager</span>
                    <button className="btn-ghost" onClick={handleLogout}>Sign Out</button>
                </div>
            </header>

            <main className="page-content">

                {/* Welcome */}
                <div className="fade-up" style={{ marginBottom: "36px" }}>
                    <h1 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>
                        Welcome back, Manager 👋
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
                        You have 24 open tasks across 3 active projects
                    </p>
                </div>



            </main>
        </div>
    );
}
