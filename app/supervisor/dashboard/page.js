"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import PaymentRequestForm from "@/components/PaymentRequestForm";
import PaymentRequestList from "@/components/PaymentRequestList";
import ShimmerLoader from "@/components/ShimmerLoader";

export default function SupervisorDashboard() {
    const router = useRouter();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial loading for better UX
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
    };

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        // Show shimmer briefly on refresh
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
    };

    return (
        <div style={{ minHeight: "100vh" }} className="responsive-root">


            <div className="bg-mesh-custom" />
            <div className="orb1" />
            <div className="orb2" />

            {/* Header */}
            <header className="page-header">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Image
                        src="/Logo_1.png"
                        alt="Solar Logo"
                        width={240}
                        height={36}
                        style={{ borderRadius: '8px' }}
                    />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span className="role-badge role-supervisor">🛠️ Supervisor</span>
                    <button className="btn-ghost" onClick={handleLogout}>Sign Out</button>
                </div>
            </header>

            <main className="page-content">
                {isLoading ? (
                    <ShimmerLoader />
                ) : (
                    <>

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

                <PaymentRequestList 
                    refreshTrigger={refreshTrigger} 
                    role="SUPERVISOR" 
                    limit={3}
                    showFilter={true}
                />
                    </>
                )}
            </main>
        </div>
    );
}
