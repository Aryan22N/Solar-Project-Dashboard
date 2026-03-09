"use client";

import { useRouter } from "next/navigation";

const actions = [
    {
        icon: "🔧",
        iconBg: "rgba(16,185,129,0.12)",
        iconColor: "#10b981",
        title: "Update Task Status",
        desc: "Mark tasks as in-progress, complete, or blocked on site.",
    },
    {
        icon: "📤",
        iconBg: "rgba(59,130,246,0.12)",
        iconColor: "#3b82f6",
        title: "Upload Reports",
        desc: "Submit daily site inspection photos and progress notes.",
    },
    {
        icon: "📍",
        iconBg: "rgba(245,158,11,0.12)",
        iconColor: "#f59e0b",
        title: "Site Check-in",
        desc: "Mark your attendance and active hours on the current site.",
    },
    {
        icon: "⚠️",
        iconBg: "rgba(248,113,113,0.12)",
        iconColor: "#f87171",
        title: "Raise Issue",
        desc: "Flag a site issue or safety concern for immediate review.",
    },
];

const stats = [
    { value: "6", label: "My Tasks", color: "#10b981" },
    { value: "2", label: "Pending Today", color: "#f59e0b" },
    { value: "4", label: "Completed", color: "#3b82f6" },
    { value: "1", label: "Issues Open", color: "#f87171" },
];

export default function SupervisorDashboard() {
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
                    <span className="role-badge role-supervisor">🛠️ Supervisor</span>
                    <button className="btn-ghost" onClick={handleLogout}>Sign Out</button>
                </div>
            </header>

            <main className="page-content">

                {/* Welcome */}
                <div className="fade-up" style={{ marginBottom: "36px" }}>
                    <h1 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>
                        Good morning, Supervisor 👋
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
                        You have 2 tasks pending for today's shift
                    </p>
                </div>



            </main>
        </div>
    );
}
