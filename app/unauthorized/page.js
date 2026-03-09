import Link from "next/link";

export const metadata = {
    title: "Unauthorized — Solar Portal",
};

export default function UnauthorizedPage() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <div className="bg-mesh" />

            <div className="glass-card fade-up" style={{ width: "100%", maxWidth: "440px", padding: "48px 40px", textAlign: "center" }}>

                <div style={{
                    width: "72px", height: "72px",
                    borderRadius: "20px",
                    background: "rgba(248,113,113,0.12)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 24px",
                    fontSize: "32px"
                }}>🚫</div>

                <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.02em" }}>
                    Access Denied
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.6, marginBottom: "32px" }}>
                    You don't have permission to access this page.
                    Please contact your administrator if you believe this is a mistake.
                </p>

                <Link href="/login" style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 28px",
                    background: "linear-gradient(135deg, #3b82f6, #818cf8)",
                    color: "#fff",
                    borderRadius: "12px",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                    transition: "opacity 0.2s",
                }}>
                    ← Back to Login
                </Link>

            </div>
        </div>
    );
}
