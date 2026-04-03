"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ShimmerLoader from "@/components/ShimmerLoader";
import ProjectEditModal from "@/components/ProjectEditModal";

export default function AllProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);

    const fetchProjects = () => {
        fetch("/api/projects")
            .then(res => res.json())
            .then(data => {
                setProjects(data);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        setIsLoading(true);
        fetchProjects();
        setTimeout(() => setIsLoading(false), 600);
    }, []);

    const handleProjectUpdated = () => {
        fetchProjects();
    };

    return (
        <div style={{ minHeight: "100vh" }} className="responsive-root">
            <div className="bg-mesh-custom" />
            <div className="orb1" />
            <div className="orb2" />

            {/* Header matching dashboard styles slightly */}
            <header className="page-header" style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", width: "100%" }}>
                    <button className="btn-ghost" onClick={() => router.back()} style={{ padding: "8px 16px" }}>← Back</button>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>All Projects ({projects.length})</h1>
                </div>
            </header>

            <main className="page-content" style={{ marginTop: 0 }}>
                {isLoading ? (
                    <ShimmerLoader />
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginTop: "24px" }}>
                        {projects.map(project => (
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
                )}
            </main>

            <ProjectEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                project={projectToEdit}
                onProjectUpdated={handleProjectUpdated}
            />
        </div>
    );
}
