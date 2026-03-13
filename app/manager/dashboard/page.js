"use client";

import { useRouter } from "next/navigation";
import PaymentRequestList from "@/components/PaymentRequestList";

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
                        Review and approve supervisor payment requests from the list below.
                    </p>
                </div>

                <PaymentRequestList role="PROJECT_MANAGER" />

            </main>
        </div>
    );
}
