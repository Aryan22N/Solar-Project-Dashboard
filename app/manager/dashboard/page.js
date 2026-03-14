"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import PaymentRequestList from "@/components/PaymentRequestList";
import ProjectProgress from "@/components/ProjectProgress";
import ShimmerLoader from "@/components/ShimmerLoader";

export default function ManagerDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial loading for better UX
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        fetch("/api/projects")
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                if (data.length > 0) setSelectedProjectId(data[0].id);
            })
            .catch(err => console.error(err));
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
                    <span className="role-badge role-manager">📋 Project Manager</span>
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
                        Welcome back, Manager 👋
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
                        Review and approve supervisor payment requests from the list below.
                    </p>
                </div>

                <PaymentRequestList role="PROJECT_MANAGER" />

                <div className="divider" style={{ margin: "48px 0" }} />

                <div style={{ marginBottom: "24px" }}>
                    <label className="stat-label">Select Project to View/Track Progress</label>
                    <select 
                        className="input-field" 
                        style={{ maxWidth: "300px", marginTop: "8px" }}
                        value={selectedProjectId || ""}
                        onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <ProjectProgress projectId={selectedProjectId} role="PROJECT_MANAGER" />
                    </>
                )}
            </main>
        </div>
    );
}
