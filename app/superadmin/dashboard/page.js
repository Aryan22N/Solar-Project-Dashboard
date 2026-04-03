"use client";

import { useRouter } from "next/navigation";
import PaymentRequestList from "@/components/PaymentRequestList";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import ProjectCreationModal from "@/components/ProjectCreationModal";
import ProjectProgress from "@/components/ProjectProgress";
import { useEffect } from "react";
import ShimmerLoader from "@/components/ShimmerLoader";
import ProjectEditModal from "@/components/ProjectEditModal";

export default function SuperAdminDashboard() {
    const router = useRouter();
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);

    const fetchProjects = () => {
        fetch("/api/projects")
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                if (!selectedProjectId) setSelectedProjectId("all");
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        setIsLoading(true);
        fetchProjects();
        setTimeout(() => setIsLoading(false), 600);
    }, []);

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
    };

    const handleProjectCreated = (newProject) => {
        fetchProjects();
    };

    const handleProjectUpdated = (updatedProject) => {
        fetchProjects();
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
                    <div className="role-badge role-super" style={{ marginBottom: "12px" }}>⚡ Super Admin</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Control Center</div>
                </div>

                <Link href="/superadmin/projects/progress" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                    <span>📈</span> Project Progress
                </Link>

                <Link href="/superadmin/history" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                    <span>📜</span> Payment History
                </Link>

                <Link href="/superadmin/gallery" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                    <span>🖼️</span> Stored Images
                </Link>

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
                    <Link href="/superadmin/projects/progress" className="btn-ghost" style={{ textDecoration: "none", height: "36px", display: "inline-flex", alignItems: "center" }}>📈 Project Progress</Link>
                    <Link href="/superadmin/gallery" className="btn-ghost" style={{ textDecoration: "none", height: "36px", display: "inline-flex", alignItems: "center" }}>🖼️ Gallery</Link>
                    <Link href="/superadmin/history" className="btn-ghost" style={{ textDecoration: "none", height: "36px", display: "inline-flex", alignItems: "center" }}>📜 History</Link>
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
                            height: "36px"
                        }}
                        onClick={() => setIsProjectModalOpen(true)}
                    >
                        + Project
                    </button>
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
                                Good day, Admin 👋
                            </h1>
                            <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
                                Review approved requests and finalize payments below.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                            <button className="btn-primary" style={{ width: "auto", padding: "10px 32px" }} onClick={() => router.push("/superadmin/projects/progress")}>
                                View Progress Tracker and Notes
                            </button>
                            <button className="btn-ghost" style={{ width: "auto", padding: "10px 32px", border: "1px solid var(--border)" }} onClick={() => router.push("/superadmin/gallery")}>
                                🖼️ View Stored Images
                            </button>
                        </div>

                        <div className="fade-up" style={{ marginBottom: "36px" }}>
                            <h2 className="section-title">Manage Projects</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                                {projects.slice(0, 6).map(project => (
                                    <div key={project.id} className="glass-card" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{project.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                {project.expense_heads?.length || 0} Heads • <span style={{ color: project.status === "ACTIVE" ? "var(--success)" : "var(--text-muted)" }}>{project.status}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button 
                                                className="btn-ghost" 
                                                onClick={() => {
                                                    setProjectToEdit(project);
                                                    setIsEditModalOpen(true);
                                                }}
                                                style={{ padding: "6px 14px", fontSize: "12px", borderRadius: "8px" }}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className={project.status === "ACTIVE" ? "btn-primary" : "btn-ghost"}
                                                style={{ 
                                                    height: "36px", 
                                                    width: "auto", 
                                                    padding: "0 12px", 
                                                    fontSize: "12px",
                                                    borderRadius: "8px",
                                                    background: project.status === "ACTIVE" ? "var(--success)" : "rgba(59,130,246,0.1)", 
                                                    borderColor: project.status === "ACTIVE" ? "var(--success)" : "rgba(59,130,246,0.2)",
                                                    color: project.status === "ACTIVE" ? "#fff" : "var(--primary)"
                                                }}
                                                onClick={async () => {
                                                    const isFinish = project.status === "ACTIVE";
                                                    const action = isFinish ? "finish" : "unarchive";
                                                    if (confirm(`Are you sure you want to ${isFinish ? "finish" : "unarchive"} this project? ${isFinish ? "All current notes will be archived." : ""}`)) {
                                                        try {
                                                            const res = await fetch(`/api/projects/${project.id}/${action}`, { method: "POST" });
                                                            if (res.ok) {
                                                                alert(`Project ${isFinish ? "finished" : "unarchived"} successfully!`);
                                                                fetchProjects();
                                                            } else {
                                                                const data = await res.json();
                                                                alert(data.error || `Failed to ${action} project`);
                                                            }
                                                        } catch (err) {
                                                            alert("An error occurred");
                                                        }
                                                    }
                                                }}
                                            >
                                                {project.status === "ACTIVE" ? "✓ Finish" : "↺ Unarchive"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {projects.length > 6 && (
                                <div style={{ textAlign: "center", marginTop: "24px" }}>
                                    <button 
                                        className="btn-ghost" 
                                        onClick={() => router.push("/superadmin/projects/all")}
                                        style={{ padding: "10px 32px", fontSize: "14px", fontWeight: 600, textDecoration: "underline" }}
                                    >
                                        Show All Projects ({projects.length})
                                    </button>
                                </div>
                            )}
                        </div>

                        <PaymentRequestList
                            role="SUPER_ADMIN"
                            limit={3}
                        />

                        <div className="divider" style={{ margin: "48px 0" }} />


                    </>
                )}
            </main>

            <ProjectCreationModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />
            <ProjectEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                project={projectToEdit}
                onProjectUpdated={handleProjectUpdated}
            />
        </div>
    );
}
