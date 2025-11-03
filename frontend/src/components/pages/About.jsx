import React from "react";

export default function About() {
    const containerStyle = {
        maxWidth: 900,
        margin: "32px auto",
        padding: 24,
        fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        color: "#222",
        lineHeight: 1.6,
    };

    const headerStyle = {
        marginBottom: 8,
        fontSize: 28,
        fontWeight: 700,
    };

    const leadStyle = {
        marginBottom: 20,
        color: "#555",
    };

    const cardStyle = {
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(16,24,40,0.06)",
        padding: 18,
        marginBottom: 16,
    };

    const teamGrid = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
        marginTop: 12,
    };

    const personStyle = {
        padding: 12,
        borderRadius: 6,
        background: "#fafafa",
        border: "1px solid #eee",
        textAlign: "center",
    };

    return (
        <main style={containerStyle} aria-labelledby="about-heading">
            <h1 id="about-heading" style={headerStyle}>
                About This Project
            </h1>

            <p style={leadStyle}>
                This is the frontend About page for the Jansan final project. It describes the purpose,
                features, and contributors of the application.
            </p>

            <section style={cardStyle} aria-labelledby="purpose-heading">
                <h2 id="purpose-heading" style={{ marginTop: 0, marginBottom: 8 }}>
                    Purpose
                </h2>
                <p>
                    The app is built with React + Vite for a fast development experience and a Node/Express + MongoDB
                    backend. It demonstrates authentication, CRUD operations, and integrations like payments and PDF
                    generation.
                </p>
            </section>

            <section style={cardStyle} aria-labelledby="features-heading">
                <h2 id="features-heading" style={{ marginTop: 0, marginBottom: 8 }}>
                    Key Features
                </h2>
                <ul>
                    <li>Authentication (JWT-based)</li>
                    <li>Product management and listing</li>
                    <li>Stripe payments integration</li>
                    <li>PDF invoice generation</li>
                    <li>Simple role-based access control</li>
                </ul>
            </section>

            <section style={cardStyle} aria-labelledby="team-heading">
                <h2 id="team-heading" style={{ marginTop: 0, marginBottom: 8 }}>
                    Contributors
                </h2>

                <div style={teamGrid}>
                    <div style={personStyle}>
                        <strong>Uki</strong>
                        <div style={{ fontSize: 13, color: "#555" }}>Frontend / Design</div>
                    </div>
                    <div style={personStyle}>
                        <strong>Jansan</strong>
                        <div style={{ fontSize: 13, color: "#555" }}>Backend / API</div>
                    </div>
                    <div style={personStyle}>
                        <strong>Helpers</strong>
                        <div style={{ fontSize: 13, color: "#555" }}>Utilities / Docs</div>
                    </div>
                </div>
            </section>

            <section style={{ marginTop: 8, textAlign: "center" }}>
                <button
                    onClick={() => window.history.back()}
                    style={{
                        marginTop: 12,
                        padding: "8px 14px",
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        background: "#fff",
                        cursor: "pointer",
                    }}
                    aria-label="Go back"
                >
                    Go back
                </button>
            </section>
        </main>
    );
}