import { RotatingLines } from "react-loader-spinner";

export default function PageLoader({
    message = "Loading…",
    color = "#1b3a6b",
    width = 56,
})
 {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            minHeight: "60vh",
            width: "100%",
         }}>
           
            <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#1b3a6b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 4,
                boxShadow: "0 8px 24px rgba(27,58,107,0.25)",
            }}>
                
                <img src="/logo.png" alt="Loading" width="28" height="28" style={{ objectFit: "contain", borderRadius: "20%" }} />
            </div>

            <RotatingLines
                strokeColor={color}
                strokeWidth="3"
                animationDuration="0.75"
                width={String(width)}
                visible={true}
            />

            <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#64748b",
                margin: 0,
                letterSpacing: "0.01em",
            }}>
                {message}
            </p>
        </div>
    );
}
