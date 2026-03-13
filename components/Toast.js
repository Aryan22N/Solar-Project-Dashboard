"use client";

import { useEffect, useState } from "react";

export default function Toast({ toasts, removeToast }) {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast-item ${toast.type}`}>
                    <div className="toast-icon">
                        {toast.type === "success" ? "✅" : "⚠️"}
                    </div>
                    <div className="toast-content">
                        <div className="toast-title">{toast.title}</div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
