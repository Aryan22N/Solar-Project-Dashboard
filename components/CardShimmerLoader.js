export default function CardShimmerLoader() {
    return (
        <div className="card-shimmer-wrapper">
            {/* Single Card Skeleton */}
            <div className="skeleton-card">
                {/* Left Side - Image Placeholder */}
                <div className="skeleton-image-section">
                    <div className="skeleton-image-placeholder"></div>
                </div>

                {/* Right Side - Content Placeholders */}
                <div className="skeleton-content-section">
                    <div className="skeleton-text-group">
                        <div className="skeleton-line skeleton-title-line"></div>
                        <div className="skeleton-line skeleton-subtitle-line"></div>
                        <div className="skeleton-line skeleton-text-line"></div>
                        <div className="skeleton-line skeleton-text-line short"></div>
                    </div>

                    <div className="skeleton-actions">
                        <div className="skeleton-button"></div>
                        <div className="skeleton-button"></div>
                    </div>
                </div>
            </div>

            {/* Repeat for multiple cards */}
            <div className="skeleton-card">
                <div className="skeleton-image-section">
                    <div className="skeleton-image-placeholder"></div>
                </div>

                <div className="skeleton-content-section">
                    <div className="skeleton-text-group">
                        <div className="skeleton-line skeleton-title-line"></div>
                        <div className="skeleton-line skeleton-subtitle-line"></div>
                        <div className="skeleton-line skeleton-text-line"></div>
                        <div className="skeleton-line skeleton-text-line short"></div>
                    </div>

                    <div className="skeleton-actions">
                        <div className="skeleton-button"></div>
                        <div className="skeleton-button"></div>
                    </div>
                </div>
            </div>

            <div className="skeleton-card">
                <div className="skeleton-image-section">
                    <div className="skeleton-image-placeholder"></div>
                </div>

                <div className="skeleton-content-section">
                    <div className="skeleton-text-group">
                        <div className="skeleton-line skeleton-title-line"></div>
                        <div className="skeleton-line skeleton-subtitle-line"></div>
                        <div className="skeleton-line skeleton-text-line"></div>
                        <div className="skeleton-line skeleton-text-line short"></div>
                    </div>

                    <div className="skeleton-actions">
                        <div className="skeleton-button"></div>
                        <div className="skeleton-button"></div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmerFlow {
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

                .card-shimmer-wrapper {
                    animation: fadeIn 0.3s ease-in-out;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    width: 100%;
                }

                .skeleton-card {
                    display: flex;
                    gap: 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    overflow: hidden;
                }

                /* Left Side - Image Section */
                .skeleton-image-section {
                    flex-shrink: 0;
                    width: 280px;
                    height: 200px;
                }

                .skeleton-image-placeholder {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0.03) 0%,
                        rgba(255, 255, 255, 0.07) 25%,
                        rgba(255, 255, 255, 0.04) 50%,
                        rgba(255, 255, 255, 0.07) 75%,
                        rgba(255, 255, 255, 0.03) 100%
                    );
                    background-size: 1000px 100%;
                    animation: shimmerFlow 2.5s infinite linear;
                    border-radius: 12px;
                }

                /* Right Side - Content Section */
                .skeleton-content-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 4px 0;
                }

                .skeleton-text-group {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .skeleton-line {
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0.03) 0%,
                        rgba(255, 255, 255, 0.07) 25%,
                        rgba(255, 255, 255, 0.04) 50%,
                        rgba(255, 255, 255, 0.07) 75%,
                        rgba(255, 255, 255, 0.03) 100%
                    );
                    background-size: 1000px 100%;
                    animation: shimmerFlow 2.5s infinite linear;
                    border-radius: 8px;
                }

                .skeleton-title-line {
                    width: 75%;
                    height: 24px;
                }

                .skeleton-subtitle-line {
                    width: 60%;
                    height: 18px;
                    opacity: 0.7;
                }

                .skeleton-text-line {
                    width: 100%;
                    height: 16px;
                }

                .skeleton-text-line.short {
                    width: 65%;
                }

                .skeleton-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 16px;
                }

                .skeleton-button {
                    width: 100px;
                    height: 36px;
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0.03) 0%,
                        rgba(255, 255, 255, 0.07) 25%,
                        rgba(255, 255, 255, 0.04) 50%,
                        rgba(255, 255, 255, 0.07) 75%,
                        rgba(255, 255, 255, 0.03) 100%
                    );
                    background-size: 1000px 100%;
                    animation: shimmerFlow 2.5s infinite linear;
                    border-radius: 8px;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .skeleton-card {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .skeleton-image-section {
                        width: 100%;
                        height: 180px;
                    }

                    .skeleton-content-section {
                        padding: 0;
                    }

                    .skeleton-title-line {
                        width: 80%;
                    }

                    .skeleton-subtitle-line {
                        width: 70%;
                    }

                    .skeleton-text-line.short {
                        width: 75%;
                    }

                    .skeleton-actions {
                        margin-top: 12px;
                    }

                    .skeleton-button {
                        width: 90px;
                        height: 32px;
                    }
                }

                @media (max-width: 480px) {
                    .skeleton-card {
                        padding: 16px;
                    }

                    .skeleton-image-section {
                        height: 160px;
                    }

                    .skeleton-title-line {
                        height: 20px;
                    }

                    .skeleton-subtitle-line {
                        height: 16px;
                    }

                    .skeleton-text-line {
                        height: 14px;
                    }

                    .skeleton-button {
                        width: 80px;
                        height: 30px;
                    }
                }
            `}</style>
        </div>
    );
}
