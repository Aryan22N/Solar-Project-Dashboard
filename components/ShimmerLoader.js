export default function ShimmerLoader() {
    return (
        <div className="shimmer-wrapper">
            <div className="premium-shimmer-big"></div>
            
            <style>{`
                .shimmer-wrapper {
                    animation: fadeIn 0.3s ease-in-out;
                    width: 100%;
                }

                @keyframes premium-shimmer-anim {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .premium-shimmer-big {
                    width: 100%;
                    height: 500px;
                    background: #f1f5f9;
                    background-image: linear-gradient(
                        to right,
                        #f1f5f9 0%,
                        #e2e8f0 20%,
                        #f1f5f9 40%,
                        #f1f5f9 100%
                    );
                    background-repeat: no-repeat;
                    background-size: 1000px 100%;
                    animation: premium-shimmer-anim 2s linear infinite;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                }
            `}</style>
        </div>
    );
}
