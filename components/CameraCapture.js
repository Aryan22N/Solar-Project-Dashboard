"use client";

import { useState, useRef, useEffect } from "react";

export default function CameraCapture({ onCapture, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function startCamera() {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "environment" }, // Prefer back camera
                    audio: false 
                });
                setStream(s);
                if (videoRef.current) {
                    videoRef.current.srcObject = s;
                }
            } catch (err) {
                console.error("Camera error:", err);
                setError("Could not access camera. Please ensure permissions are granted.");
            }
        }
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(dataUrl);
        stopCamera();
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onClose();
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 1100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "500px", borderRadius: "16px", overflow: "hidden", background: "#000" }}>
                {error ? (
                    <div style={{ padding: "40px", color: "#fff", textAlign: "center" }}>
                        <p>{error}</p>
                        <button className="btn-primary" onClick={onClose} style={{ marginTop: "20px" }}>Close</button>
                    </div>
                ) : (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            style={{ width: "100%", display: "block" }}
                        />
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                        
                        <div style={{
                            position: "absolute",
                            bottom: "20px",
                            left: 0,
                            right: 0,
                            display: "flex",
                            justifyContent: "center",
                            gap: "20px"
                        }}>
                            <button 
                                type="button"
                                onClick={capturePhoto}
                                style={{
                                    width: "70px",
                                    height: "70px",
                                    borderRadius: "50%",
                                    border: "5px solid #fff",
                                    background: "rgba(255,255,255,0.3)",
                                    cursor: "pointer"
                                }}
                            />
                        </div>
                        <button 
                            type="button"
                            onClick={onClose}
                            style={{
                                position: "absolute",
                                top: "15px",
                                right: "15px",
                                background: "rgba(0,0,0,0.5)",
                                border: "none",
                                color: "#fff",
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                cursor: "pointer",
                                fontSize: "18px"
                            }}
                        >
                            ✕
                        </button>
                    </>
                )}
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "20px", fontSize: "14px" }}>
                Point at the material and tap the white button
            </p>
        </div>
    );
}
