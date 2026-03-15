"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import PaymentRequestForm from "@/components/PaymentRequestForm";
import PaymentRequestList from "@/components/PaymentRequestList";
import ProjectProgress from "@/components/ProjectProgress";
import ShimmerLoader from "@/components/ShimmerLoader";

export default function SupervisorDashboard() {
    const router = useRouter();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    useEffect(() => {
        // Simulate initial loading for better UX
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        fetch("/api/projects?status=ACTIVE")
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                setSelectedProjectId("all");
            })
            .catch(err => console.error(err));
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

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? "open" : ""}`}>
                <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>✕</button>
                <div style={{ marginBottom: "24px", textAlign: "center" }}>
                    <div className="role-badge role-supervisor" style={{ marginBottom: "12px" }}>🛠️ Supervisor</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Field Operations</div>
                </div>
                
                <button className="mobile-menu-link" style={{ width: "100%", background: "rgba(248, 113, 113, 0.05)", borderColor: "rgba(248, 113, 113, 0.2)", color: "var(--danger)" }} onClick={handleLogout}>
                    <span>🚪</span> Sign Out
                </button>
            </div>

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
                <div className="nav-desktop">
                    <span className="role-badge role-supervisor">🛠️ Supervisor</span>
                    <button className="btn-ghost" onClick={handleLogout}>Sign Out</button>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor" />
                            <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" />
                            <rect x="3" y="13" width="14" height="2" rx="1" fill="currentColor" />
                        </svg>
                    </button>
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

                <div className="divider" style={{ margin: "48px 0" }} />

                <div className="fade-up" style={{ marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>Project Progress & Notes</h2>
                    <label className="stat-label">Select Project to View/Track Progress</label>
                    <select 
                        className="input-field" 
                        style={{ maxWidth: "340px", marginTop: "8px" }}
                        value={selectedProjectId || "all"}
                        onChange={(e) => setSelectedProjectId(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                    >
                        <option value="all">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <ProjectProgress projectId={selectedProjectId} role="SUPERVISOR" />
                    </>
                )}
            </main>
        </div>
    );
}
