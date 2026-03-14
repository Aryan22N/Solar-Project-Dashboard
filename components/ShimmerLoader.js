export default function ShimmerLoader() {
    return (
        <div className="shimmer-wrapper">
            {/* Title Section */}
            <div className="shimmer-title-section">
                <div className="shimmer-line shimmer-short"></div>
                <div className="shimmer-line shimmer-long"></div>
            </div>

            {/* Form Section */}
            <div className="shimmer-form-section">
                <div className="shimmer-card">
                    <div className="shimmer-line shimmer-medium" style={{ marginBottom: "20px" }}></div>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                        <div className="shimmer-line shimmer-small"></div>
                        <div className="shimmer-line shimmer-small"></div>
                    </div>
                    <div className="shimmer-line shimmer-full" style={{ marginBottom: "12px" }}></div>
                    <div className="shimmer-line shimmer-full" style={{ marginBottom: "12px" }}></div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <div className="shimmer-button"></div>
                        <div className="shimmer-button"></div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="shimmer-list-section">
                <div className="shimmer-line shimmer-medium" style={{ marginBottom: "20px" }}></div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="shimmer-card shimmer-item">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                    <div className="shimmer-line shimmer-badge"></div>
                                    <div className="shimmer-line shimmer-badge"></div>
                                </div>
                                <div className="shimmer-line shimmer-small" style={{ marginBottom: "8px" }}></div>
                                <div className="shimmer-line shimmer-small" style={{ marginBottom: "4px", opacity: 0.6 }}></div>
                                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                    <div className="shimmer-line shimmer-tag"></div>
                                    <div className="shimmer-line shimmer-tag"></div>
                                    <div className="shimmer-line shimmer-tag"></div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div className="shimmer-line shimmer-price" style={{ marginBottom: "12px" }}></div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <div className="shimmer-button shimmer-small-btn"></div>
                                    <div className="shimmer-button shimmer-small-btn"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .shimmer-wrapper {
                    animation: fadeIn 0.3s ease-in-out;
                }

                @keyframes shimmer {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

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
                    height: 16px;
                }

                /* Size Variants */
                .shimmer-short {
                    width: 200px;
                    height: 32px;
                }

                .shimmer-long {
                    width: 100%;
                    max-width: 600px;
                    height: 18px;
                }

                .shimmer-medium {
                    width: 250px;
                    height: 24px;
                }

                .shimmer-small {
                    width: 150px;
                }

                .shimmer-full {
                    width: 100%;
                }

                .shimmer-badge {
                    width: 100px;
                    height: 20px;
                    border-radius: 6px;
                }

                .shimmer-tag {
                    width: 80px;
                    height: 24px;
                    border-radius: 6px;
                }

                .shimmer-price {
                    width: 120px;
                    height: 24px;
                }

                /* Card & Container */
                .shimmer-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .shimmer-item {
                    animation: shimmerItem 2s infinite linear;
                }

                @keyframes shimmerItem {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                /* Buttons */
                .shimmer-button {
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0.03) 0%,
                        rgba(255, 255, 255, 0.08) 50%,
                        rgba(255, 255, 255, 0.03) 100%
                    );
                    background-size: 1000px 100%;
                    animation: shimmer 2s infinite linear;
                    border-radius: 8px;
                    height: 40px;
                    width: 120px;
                }

                .shimmer-small-btn {
                    width: 80px;
                    height: 36px;
                }

                /* Sections */
                .shimmer-title-section {
                    margin-bottom: 36px;
                }

                .shimmer-form-section {
                    margin-bottom: 48px;
                }

                .shimmer-list-section {
                    margin-top: 24px;
                }
            `}</style>
        </div>
    );
}
