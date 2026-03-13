"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentHistory() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/payment-requests");
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="spinner" style={{ margin: "100px auto", display: "block" }}></div>;

    return (
        <div style={{ minHeight: "100vh" }}>
            <div className="bg-mesh no-print" />

            <header className="page-header no-print">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "22px" }}>☀️</span>
                    <span className="logo-text">Solar Portal</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <Link href="/superadmin/dashboard" className="btn-ghost" style={{ textDecoration: "none" }}>← Back to Dashboard</Link>
                    <button className="btn-primary" onClick={handlePrint} style={{ width: "auto", padding: "8px 20px" }}>🖨️ Print Records</button>
                    <button className="btn-ghost" onClick={() => router.push("/login")}>Sign Out</button>
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

                <div className="glass-card printable-area" style={{ padding: "0", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Date</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Project</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Supervisor</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Materials</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Amount</th>
                                <th style={{ padding: "16px 24px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "16px 24px", fontSize: "14px" }}>{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600 }}>{req.project?.name}</td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px" }}>{req.supervisor?.name}</td>
                                    <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)" }}>
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
                            ))}
                        </tbody>
                    </table>
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
