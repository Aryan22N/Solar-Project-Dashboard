"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, dob }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "An error occurred. Please try again.");
                setLoading(false);
                return;
            }

            if (data.role === "SUPER_ADMIN") router.push("/superadmin/dashboard");
            else if (data.role === "PROJECT_MANAGER") router.push("/manager/dashboard");
            else if (data.role === "SUPERVISOR") router.push("/supervisor/dashboard");
            else {
                setError("Unknown role — contact your administrator.");
                setLoading(false);
            }
        } catch {
            setError("Network error. Please check your connection.");
            setLoading(false);
        }
    };

    // Animation variants
    const leftPanel = {
        hidden: { opacity: 0, x: -60 },
        show: {
            opacity: 1, x: 0,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
        },
    };

    const rightPanel = {
        hidden: { opacity: 0, x: 60 },
        show: {
            opacity: 1, x: 0,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
        },
    };

    const stagger = {
        show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
    };

    const pillVariant = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
    };

    return (
        <div style={styles.root} className="responsive-root">
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse-orb {
                    0%, 100% { transform: scale(1); opacity: 0.7; }
                    50% { transform: scale(1.15); opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                .input-wrap:focus-within {
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.2) !important;
                    border-color: #6366f1 !important;
                }
                .sign-in-btn:not(:disabled):hover {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 28px rgba(99,102,241,0.45) !important;
                }
                .sign-in-btn:not(:disabled):active {
                    transform: translateY(0);
                }

                /* Mobile Responsiveness */
                @media (max-width: 992px) {
                    .responsive-root {
                        flex-direction: column !important;
                        overflow-y: auto !important;
                        overflow-x: hidden !important;
                    }
                    .responsive-left {
                        flex: none !important;
                    }
                    .responsive-left-inner {
                        padding: 40px 24px !important;
                        height: auto !important;
                    }
                    .responsive-hero-block {
                        padding-top: 40px !important;
                        margin-top: 20px !important;
                    }
                    .responsive-hero-title {
                        font-size: 32px !important;
                    }
                    .responsive-hero-title br {
                        display: none;
                    }
                    .responsive-pill-row {
                        flex-direction: row !important;
                        flex-wrap: wrap !important;
                        margin-top: 30px !important;
                    }
                    .responsive-sec-badge {
                        padding-top: 40px !important;
                        margin-top: 20px !important;
                    }
                    .responsive-right {
                        flex: none !important;
                        padding: 40px 24px 60px 24px !important;
                        align-items: flex-start !important;
                    }
                    .responsive-form-card {
                        max-width: 100% !important;
                        margin: 0 auto !important;
                    }
                }

                @media (max-width: 480px) {
                    .responsive-hero-title {
                        font-size: 28px !important;
                        line-height: 1.3 !important;
                    }
                    .responsive-left-inner {
                        padding: 30px 20px !important;
                    }
                    .responsive-right {
                        padding: 30px 20px 60px 20px !important;
                    }
                    .responsive-form-title {
                        font-size: 24px !important;
                    }
                }
            `}</style>

            {/* ── Left panel ─────────────────────────────── */}
            <motion.div
                style={styles.left}
                className="responsive-left"
                variants={leftPanel}
                initial="hidden"
                animate="show"
            >
                {/* Animated glow orbs */}
                <motion.div
                    style={styles.orb1}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    style={styles.orb2}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                <motion.div
                    style={styles.orb3}
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />

                {/* Grid pattern */}
                <div style={styles.grid} />

                <motion.div
                    style={styles.leftInner}
                    className="responsive-left-inner"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                >
                    {/* Logo */}
                    <motion.div style={styles.leftLogo} variants={fadeUp}>
                        <motion.div
                            style={styles.logoIcon}
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            ☀️
                        </motion.div>
                        <span style={styles.logoText}>SOLAR</span>
                    </motion.div>

                    {/* Hero text */}
                    <motion.div style={styles.heroBlock} className="responsive-hero-block" variants={stagger}>
                        <motion.h2 style={styles.heroTitle} className="responsive-hero-title" variants={fadeUp}>
                            Powering smarter<br />infrastructure.
                        </motion.h2>
                        <motion.p style={styles.heroSub} variants={fadeUp}>
                            A unified platform for solar project teams — from field to boardroom.
                        </motion.p>
                    </motion.div>

                    {/* Role pills */}
                    <motion.div style={styles.pillRow} className="responsive-pill-row" variants={stagger}>
                        {[
                            { icon: "⚡", label: "Super Admin", color: "#f59e0b" },
                            { icon: "📋", label: "Project Manager", color: "#60a5fa" },
                            { icon: "🛠️", label: "Supervisor", color: "#34d399" },
                        ].map((r) => (
                            <motion.div
                                key={r.label}
                                style={{ ...styles.pill, borderColor: r.color + "40", color: r.color }}
                                variants={pillVariant}
                                whileHover={{ x: 6, transition: { duration: 0.2 } }}
                            >
                                <span>{r.icon}</span>
                                <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.02em" }}>{r.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Security badge */}
                    <motion.div style={styles.secBadge} className="responsive-sec-badge" variants={fadeUp}>
                        <span style={{ opacity: 0.5, fontSize: "11px" }}>🔒</span>
                        <span style={{ opacity: 0.45, fontSize: "11px", letterSpacing: "0.05em" }}>
                            SECURED WITH JWT + BCRYPT ENCRYPTION
                        </span>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* ── Right panel ────────────────────────────── */}
            <motion.div
                style={styles.right}
                className="responsive-right"
                variants={rightPanel}
                initial="hidden"
                animate="show"
            >
                <motion.div
                    style={styles.formCard}
                    className="responsive-form-card"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                >
                    {/* Header */}
                    <motion.div style={styles.formHeader} variants={fadeUp}>
                        <p style={styles.formEyebrow}>WELCOME BACK</p>
                        <h1 style={styles.formTitle} className="responsive-form-title">Sign in to your account</h1>
                        <p style={styles.formSub}>
                            Use your registered phone number and date of birth.
                        </p>
                    </motion.div>

                    <form onSubmit={handleLogin} style={styles.form}>

                        {/* Phone */}
                        <motion.div style={styles.field} variants={fadeUp}>
                            <label style={styles.label}>Phone Number</label>
                            <div className="input-wrap" style={styles.inputWrap}>
                                <span style={styles.inputIcon}>📱</span>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="Enter your 10-digit number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    required
                                    autoComplete="tel"
                                    style={styles.input}
                                />
                            </div>
                        </motion.div>

                        {/* DOB */}
                        <motion.div style={styles.field} variants={fadeUp}>
                            <label style={styles.label}>Date of Birth</label>
                            <div className="input-wrap" style={styles.inputWrap}>
                                <span style={styles.inputIcon}>📅</span>
                                <input
                                    id="dob"
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <p style={styles.hint}>Your date of birth serves as your password.</p>
                        </motion.div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    style={styles.errorBox}
                                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <motion.div variants={fadeUp}>
                            <motion.button
                                type="submit"
                                disabled={loading}
                                suppressHydrationWarning
                                className="sign-in-btn"
                                style={{
                                    ...styles.btn,
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? "not-allowed" : "pointer",
                                }}
                                whileTap={!loading ? { scale: 0.98 } : {}}
                            >
                                {loading ? (
                                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={styles.spinner} />
                                        Signing in…
                                    </span>
                                ) : (
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        Sign In
                                        <motion.svg
                                            width="16" height="16" viewBox="0 0 16 16" fill="none"
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </motion.svg>
                                    </span>
                                )}
                            </motion.button>
                        </motion.div>
                    </form>

                    {/* Divider */}
                    <motion.div style={styles.divRow} variants={fadeUp}>
                        <div style={styles.divLine} />
                        <span style={styles.divText}>Access level is determined by your role</span>
                        <div style={styles.divLine} />
                    </motion.div>

                    {/* Role legend */}
                    <motion.div style={styles.legend} variants={stagger}>
                        {[
                            { dot: "#f59e0b", label: "Super Admin — Full platform access" },
                            { dot: "#6366f1", label: "Project Manager — Project oversight" },
                            { dot: "#10b981", label: "Supervisor — Field task management" },
                        ].map((r, i) => (
                            <motion.div
                                key={r.label}
                                style={styles.legendRow}
                                variants={fadeUp}
                                custom={i}
                            >
                                <motion.div
                                    style={{ ...styles.dot, background: r.dot }}
                                    animate={{ scale: [1, 1.4, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                                />
                                <span style={styles.legendText}>{r.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                </motion.div>
            </motion.div>
        </div>
    );
}

/* ── Styles ──────────────────────────────────────────────────── */
const styles = {
    root: {
        display: "flex",
        minHeight: "100vh",
        fontFamily: "var(--font-inter, 'Inter', sans-serif)",
        overflow: "hidden",
    },
    left: {
        display: "flex",
        flexDirection: "column",
        flex: "0 0 45%",
        background: "linear-gradient(160deg, #0f1629 0%, #0d1117 60%, #0a0f1e 100%)",
        position: "relative",
        overflow: "hidden",
    },
    orb1: {
        position: "absolute",
        top: "-80px",
        left: "-80px",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    orb2: {
        position: "absolute",
        bottom: "60px",
        right: "-60px",
        width: "320px",
        height: "320px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    orb3: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "250px",
        height: "250px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    grid: {
        position: "absolute",
        inset: 0,
        backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
    },
    leftInner: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "44px 48px",
    },
    leftLogo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    logoIcon: { fontSize: "22px" },
    logoText: {
        fontSize: "17px",
        fontWeight: 800,
        letterSpacing: "0.18em",
        color: "#fff",
    },
    heroBlock: { marginTop: "auto", paddingTop: "60px" },
    heroTitle: {
        fontSize: "38px",
        fontWeight: 800,
        color: "#f0f4ff",
        lineHeight: 1.2,
        letterSpacing: "-0.03em",
        margin: "0 0 16px 0",
    },
    heroSub: {
        fontSize: "15px",
        color: "rgba(240,244,255,0.5)",
        lineHeight: 1.7,
        maxWidth: "320px",
        margin: 0,
    },
    pillRow: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "40px",
    },
    pill: {
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 16px",
        border: "1px solid",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(8px)",
        width: "fit-content",
        cursor: "default",
    },
    secBadge: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "auto",
        paddingTop: "48px",
        color: "#fff",
    },
    right: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        padding: "40px 32px",
    },
    formCard: { width: "100%", maxWidth: "420px" },
    formHeader: { marginBottom: "32px" },
    formEyebrow: {
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.14em",
        color: "#6366f1",
        margin: "0 0 10px 0",
    },
    formTitle: {
        fontSize: "26px",
        fontWeight: 800,
        color: "#0f172a",
        letterSpacing: "-0.03em",
        margin: "0 0 8px 0",
        lineHeight: 1.2,
    },
    formSub: {
        fontSize: "14px",
        color: "#64748b",
        margin: 0,
        lineHeight: 1.6,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "18px",
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
    },
    label: {
        fontSize: "13px",
        fontWeight: 600,
        color: "#374151",
        letterSpacing: "0.01em",
    },
    inputWrap: {
        display: "flex",
        alignItems: "center",
        background: "#fff",
        border: "1.5px solid #e2e8f0",
        borderRadius: "10px",
        padding: "0 14px",
        gap: "10px",
        transition: "box-shadow 0.2s, border-color 0.2s",
    },
    inputIcon: { fontSize: "16px", flexShrink: 0 },
    input: {
        flex: 1,
        border: "none",
        outline: "none",
        background: "transparent",
        fontSize: "14px",
        color: "#0f172a",
        padding: "13px 0",
        fontFamily: "inherit",
    },
    hint: { fontSize: "12px", color: "#94a3b8", margin: 0 },
    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 14px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "10px",
        color: "#dc2626",
        fontSize: "13px",
        fontWeight: 500,
    },
    btn: {
        width: "100%",
        padding: "14px",
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: 600,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
        transition: "box-shadow 0.2s, transform 0.15s",
        marginTop: "4px",
    },
    spinner: {
        display: "inline-block",
        width: "16px",
        height: "16px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
    },
    divRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "28px 0 20px",
    },
    divLine: { flex: 1, height: "1px", background: "#e2e8f0" },
    divText: {
        fontSize: "11px",
        color: "#94a3b8",
        whiteSpace: "nowrap",
        fontWeight: 500,
    },
    legend: { display: "flex", flexDirection: "column", gap: "10px" },
    legendRow: { display: "flex", alignItems: "center", gap: "10px" },
    dot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
    legendText: { fontSize: "13px", color: "#475569" },
};
