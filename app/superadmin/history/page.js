"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ShimmerLoader from "@/components/ShimmerLoader";
import TableShimmerLoader from "@/components/TableShimmerLoader";
import CardShimmerLoader from "@/components/CardShimmerLoader";

export default function PaymentHistory() {
    const [requests, setRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Show shimmer for initial load
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/payment-requests");
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchProjects();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const filteredRequests = selectedProjectId
        ? requests.filter(req => req.project_id === selectedProjectId)
        : requests;

    if (loading) return (
        <div style={{ minHeight: "100vh" }}>
            <div className="bg-mesh no-print" />
            <header className="page-header no-print">
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
                    <Link href="/superadmin/dashboard" className="btn-ghost" style={{ textDecoration: "none" }}>← Back to Dashboard</Link>
                    <button className="btn-primary" style={{ width: "auto", padding: "8px 20px" }}>🖨️ Print Records</button>
                    <button className="btn-ghost">Sign Out</button>
                </div>
            </header>
            <main className="page-content">
                <div className="fade-up" style={{ marginBottom: "36px" }}>
                    <div className="shimmer-line shimmer-medium" style={{ width: '300px', height: '32px', marginBottom: '8px' }}></div>
                    <div className="shimmer-line shimmer-long" style={{ width: '500px', height: '18px' }}></div>
                </div>
                <CardShimmerLoader />
            </main>
            <style>{`
                .shimmer-line {
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0.03) 0%,
                        rgba(255, 255, 255, 0.08) 50%,
                        rgba(255, 255, 255, 0.03) 100%
                    );
                    background-size: 1000px 100%;
                    animation: shimmer 2s infinite linear;
                    border-radius: 4px;
                }
                @keyframes shimmer {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }
            `}</style>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh" }}>
            <div className="bg-mesh no-print" />

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? "open" : ""}`}>
                <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>✕</button>
                <div style={{ marginBottom: "24px", textAlign: "center" }}>
                    <div className="role-badge role-super" style={{ marginBottom: "12px" }}>⚡ Super Admin</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Control Center</div>
                </div>
                
                <Link href="/superadmin/dashboard" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                    <span>🏠</span> Dashboard
                </Link>
                
                <button className="mobile-menu-link" style={{ width: "100%", background: "rgba(248, 113, 113, 0.05)", borderColor: "rgba(248, 113, 113, 0.2)", color: "var(--danger)" }} onClick={() => router.push("/login")}>
                    <span>🚪</span> Sign Out
                </button>
            </div>

            <header className="page-header no-print">
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
                    <Link href="/superadmin/dashboard" className="btn-ghost" style={{ textDecoration: "none" }}>← Back to Dashboard</Link>
                    <button className="btn-primary" onClick={handlePrint} style={{ width: "auto", padding: "8px 20px" }}>🖨️ Print Records</button>
                    <button className="btn-ghost" onClick={() => router.push("/login")}>Sign Out</button>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button 
                        className="btn-primary mobile-only-btn" 
                        style={{ padding: "6px 14px", fontSize: "12px", width: "auto", height: "36px" }} 
                        onClick={handlePrint}
                    >
                        🖨️ Print
                    </button>
                    <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor"/>
                            <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor"/>
                            <rect x="3" y="13" width="14" height="2" rx="1" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </header>

            <main className="page-content">
                <div className="fade-up" style={{ marginBottom: "36px" }}>
                    <h1 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>
                        Payment History
                    </h1>
                    <p className="no-print" style={{ color: "var(--text-muted)", fontSize: "15px" }}>
                        Historical record of all payment requests and their final status.
                    </p>
                </div>

                <div className="no-print" style={{ marginBottom: "24px" }}>
                    <label className="stat-label">Filter by Project</label>
                    <select 
                        className="input-field" 
                        style={{ maxWidth: "300px", marginTop: "8px" }}
                        value={selectedProjectId || ""}
                        onChange={(e) => setSelectedProjectId(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="table-responsive" style={{ overflowX: "auto", overflowY: "auto", maxWidth: "100%" }}>
                    <div className="glass-card printable-area" style={{ padding: "0", minWidth: "1000px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", width: "12%" }}>Date</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", width: "20%" }}>Project</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", width: "15%" }}>Requested By</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", width: "15%" }}>Approver (PM)</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", width: "23%" }}>Materials</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", width: "10%" }}>Amount</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", width: "10%" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                                        {selectedProjectId ? "No payment requests found for this project." : "No payment requests found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                <tr key={req.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "16px 24px", fontSize: "14px" }}>{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600 }}>{req.project?.name}</td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px" }}>{req.supervisor?.name || "Self"}</td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px" }}>{req.pm?.name || "Pending/N/A"}</td>
                                    <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                        {req.materials.map(m => `${m.name} (x${m.quantity})`).join(", ")}
                                    </td>
                                    <td style={{ padding: "16px 24px", fontSize: "15px", fontWeight: 700 }}>₹{parseFloat(req.total_amount).toLocaleString()}</td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <span className="role-badge" style={{
                                            background: req.status === "PAID" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                                            color: req.status === "PAID" ? "#10b981" : "var(--text-muted)",
                                            fontSize: "11px"
                                        }}>
                                            {req.status.replace("_", " ")}
                                        </span>
                                    </td>
                                </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: #fff !important;
                        color: #000 !important;
                    }
                    .glass-card {
                        background: none !important;
                        border: 1px solid #ddd !important;
                        box-shadow: none !important;
                        backdrop-filter: none !important;
                    }
                    th, td {
                        border-bottom: 1px solid #eee !important;
                        color: #000 !important;
                    }
                    .page-content {
                        padding: 0 !important;
                        max-width: 100% !important;
                    }
                    .role-badge {
                        border: 1px solid #ccc !important;
                        background: none !important;
                        color: #000 !important;
                    }
                }
            `}</style>
        </div>
    );
}
