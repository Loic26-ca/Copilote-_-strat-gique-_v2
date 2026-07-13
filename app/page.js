"use client";
import React, { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = {
  bg: "#12172B",
  panel: "#1A2140",
  panelLight: "#212A4E",
  brass: "#C9A24B",
  teal: "#4FA88F",
  coral: "#C1543C",
  ink: "#EDE6D6",
  inkDim: "#9AA0BE",
  line: "#33395C",
};

const DIMENSIONS = [
  { key: "clients", label: "Clients", color: "#4FA88F" },
  { key: "tresorerie", label: "Trésorerie", color: "#C9A24B" },
  { key: "croissance", label: "Croissance", color: "#7B9EDB" },
  { key: "visibilite", label: "Visibilité", color: "#C1543C" },
];

export default function Home() {
  const [profile, setProfile] = useState("");
  const [situation, setSituation] = useState({ clients: 5, tresorerie: 5, croissance: 5, visibilite: 5 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chartData = DIMENSIONS.map((d) => ({ label: d.label, value: situation[d.key] }));

  async function handleAnalyse() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, entries: [], situation, tags: [] }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.ink, padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: COLORS.brass, fontSize: "28px", marginBottom: "8px" }}>Copilote Stratégique</h1>
      <p style={{ color: COLORS.inkDim, marginBottom: "24px" }}>Analyse ta situation et reçois des recommandations.</p>

      <div style={{ background: COLORS.panel, borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Décris ton profil / ton activité</label>
        <textarea
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          rows={4}
          style={{ width: "100%", background: COLORS.panelLight, color: COLORS.ink, border: `1px solid ${COLORS.line}`, borderRadius: "8px", padding: "10px" }}
        />
      </div>

      <div style={{ background: COLORS.panel, borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
        <h2 style={{ marginTop: 0 }}>Ta situation actuelle</h2>
        {DIMENSIONS.map((d) => (
          <div key={d.key} style={{ marginBottom: "12px" }}>
            <label>{d.label}: {situation[d.key]}</label>
            <input
              type="range"
              min="0"
              max="10"
              value={situation[d.key]}
              onChange={(e) => setSituation({ ...situation, [d.key]: Number(e.target.value) })}
              style={{ width: "100%" }}
            />
          </div>
        ))}
        <div style={{ height: "260px", marginTop: "20px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke={COLORS.line} />
              <PolarAngleAxis dataKey="label" stroke={COLORS.inkDim} />
              <PolarRadiusAxis stroke={COLORS.inkDim} domain={[0, 10]} />
              <Radar dataKey="value" stroke={COLORS.brass} fill={COLORS.brass} fillOpacity={0.4} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <button
        onClick={handleAnalyse}
        disabled={loading}
        style={{ background: COLORS.brass, color: COLORS.bg, border: "none", borderRadius: "8px", padding: "12px 24px", fontWeight: "bold", cursor: "pointer" }}
      >
        {loading ? "Analyse en cours..." : "Analyser ma situation"}
      </button>

      {error && (
        <div style={{ marginTop: "20px", padding: "16px", background: COLORS.coral, borderRadius: "8px" }}>
          Erreur : {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "20px", padding: "20px", background: COLORS.panel, borderRadius: "12px" }}>
          <h2 style={{ color: COLORS.teal }}>Recommandations</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: COLORS.ink }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
