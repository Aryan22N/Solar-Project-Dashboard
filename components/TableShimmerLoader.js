export default function TableShimmerLoader() {
    return (
        <div className="shimmer-table-wrapper">
            {/* Table Header Shimmer */}
            <div className="shimmer-table-header">
                <div className="shimmer-table-cell" style={{ width: '15%' }}></div>
                <div className="shimmer-table-cell" style={{ width: '20%' }}></div>
                <div className="shimmer-table-cell" style={{ width: '15%' }}></div>
                <div className="shimmer-table-cell" style={{ width: '15%' }}></div>
                <div className="shimmer-table-cell" style={{ width: '20%' }}></div>
                <div className="shimmer-table-cell" style={{ width: '10%' }}></div>
                <div className="shimmer-table-cell" style={{ width: '5%' }}></div>
            </div>
            
            {/* Table Rows Shimmer */}
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="shimmer-table-row">
                    <div className="shimmer-table-cell" style={{ width: '15%' }}></div>
                    <div className="shimmer-table-cell" style={{ width: '20%' }}></div>
                    <div className="shimmer-table-cell" style={{ width: '15%' }}></div>
                    <div className="shimmer-table-cell" style={{ width: '15%' }}></div>
                    <div className="shimmer-table-cell" style={{ width: '20%' }}></div>
                    <div className="shimmer-table-cell" style={{ width: '10%' }}></div>
                    <div className="shimmer-table-cell" style={{ width: '5%' }}></div>
                </div>
            ))}
            
            <style>{`
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

                .shimmer-table-wrapper {
                    animation: fadeIn 0.3s ease-in-out;
                    width: 100%;
                }

                .shimmer-table-header {
                    display: flex;
                    gap: 0;
                    padding: 16px 24px;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .shimmer-table-row {
                    display: flex;
                    gap: 0;
                    padding: 16px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    animation: shimmerRow 3s infinite linear;
                }

                .shimmer-table-cell {
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0.03) 0%,
                        rgba(255, 255, 255, 0.08) 50%,
                        rgba(255, 255, 255, 0.03) 100%
                    );
                    background-size: 1000px 100%;
                    animation: shimmer 2s infinite linear;
                    border-radius: 4px;
                    height: 20px;
                }

                @keyframes shimmerRow {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }
            `}</style>
        </div>
    );
}
