"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PaymentRequestForm from "@/components/PaymentRequestForm";
import PaymentRequestList from "@/components/PaymentRequestList";

export default function SupervisorDashboard() {
    const router = useRouter();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
    };

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
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
                        Submit and track material payment requests below.
                    </p>
                </div>

                <PaymentRequestForm onSuccess={handleSuccess} />
                
                <PaymentRequestList refreshTrigger={refreshTrigger} role="SUPERVISOR" />

            </main>
        </div>
    );
}
