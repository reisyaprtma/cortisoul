"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { journalsApi, type Journal, type StressLevel, type EmotionSummary } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [stressLevels, setStressLevels] = useState<StressLevel[]>([]);
  const [emotionSummary, setEmotionSummary] = useState<EmotionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayJournal, setTodayJournal] = useState<Journal | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [journalsRes, stressRes, emotionRes] = await Promise.all([
        journalsApi.getAll(),
        journalsApi.getWeeklyStress(),
        journalsApi.getWeeklyEmotion(),
      ]);

      const allJournals = journalsRes.data?.journals || [];
      setJournals(allJournals);

      // Check if there's a journal written today
      const today = new Date().toDateString();
      const todayJ = allJournals.find(
        (j: Journal) => new Date(j.created_at).toDateString() === today
      );
      setTodayJournal(todayJ || null);

      setStressLevels(stressRes.data?.stressLevels || []);
      setEmotionSummary(emotionRes.data?.emotionSummary || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const todayDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Compute dominant emotion
  const dominantEmotion =
    emotionSummary.length > 0
      ? emotionSummary.reduce((a, b) => (a.count >= b.count ? a : b))
      : null;

  // Stress chart data
  const maxStress = 10;
  const chartWidth = 300;
  const chartHeight = 100;

  const stressPoints = stressLevels.map((s, i) => ({
    x: (i / (stressLevels.length - 1 || 1)) * chartWidth,
    y: s.averageScore !== null
      ? chartHeight - (s.averageScore / maxStress) * chartHeight
      : null,
    ...s,
  }));

  const pathPoints = stressPoints.filter((p) => p.y !== null);
  const svgPath =
    pathPoints.length > 1
      ? pathPoints
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ")
      : "";

  const areaPath =
    pathPoints.length > 1
      ? `${svgPath} L ${pathPoints[pathPoints.length - 1].x} ${chartHeight} L ${pathPoints[0].x} ${chartHeight} Z`
      : "";

  // Average stress this week
  const validScores = stressLevels
    .filter((s) => s.averageScore !== null)
    .map((s) => s.averageScore as number);
  const avgStress =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : null;

  if (isLoading) {
    return (
      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "120px",
              background: "#fff",
              borderRadius: "16px",
              animation: "pulse-soft 2s infinite",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: "900px" }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "4px" }}>
          {todayDate}
        </p>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
          {greeting()}, {user?.username || "Pengguna"}! 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Bagaimana perasaanmu hari ini? Yuk ceritakan lewat jurnal.
        </p>
      </div>

      {/* Quick action & Today status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {/* Write Journal CTA */}
        <div
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
            borderRadius: "16px",
            padding: "24px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-30px",
              right: "-30px",
              width: "120px",
              height: "120px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-20px",
              right: "20px",
              width: "80px",
              height: "80px",
              background: "rgba(255,255,255,0.07)",
              borderRadius: "50%",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>✍️</div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>
              {todayJournal ? "Edit Jurnal Hari Ini" : "Tulis Jurnal Hari Ini"}
            </h2>
            <p style={{ fontSize: "12.5px", opacity: 0.85, marginBottom: "16px" }}>
              {todayJournal
                ? "Kamu sudah menulis jurnal hari ini 🎉"
                : "Ceritakan harimu dan dapatkan insight emosional"}
            </p>
            <Link
              href={todayJournal ? `/journal/${todayJournal.id}` : "/journal/new"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                backdropFilter: "blur(4px)",
              }}
            >
              {todayJournal ? "Lihat Jurnal" : "Mulai Menulis"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Dominant Sentiment */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "var(--accent-blue-light)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
              Emosi Dominan Minggu Ini
            </span>
          </div>

          {dominantEmotion ? (
            <>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px", textTransform: "capitalize" }}>
                {emotionEmoji(dominantEmotion.emotion)} {dominantEmotion.emotion}
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Muncul {dominantEmotion.count}x dalam jurnal mingguan
              </p>
              {/* Mini emotion bars */}
              <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {emotionSummary.slice(0, 3).map((e) => (
                  <div key={e.emotion}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{e.emotion}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{e.count}</span>
                    </div>
                    <div style={{ height: "4px", background: "var(--bg-primary)", borderRadius: "99px" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(e.count / (dominantEmotion?.count || 1)) * 100}%`,
                          background: "linear-gradient(90deg, #0ea5e9, #8b5cf6)",
                          borderRadius: "99px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}>
              Belum ada data emosi minggu ini. Mulai menulis jurnal!
            </p>
          )}
        </div>
      </div>

      {/* Stress Chart */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
              Tingkat Stres Minggu Ini
            </h2>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
              Berdasarkan analisis jurnal harianmu
            </p>
          </div>
          {avgStress && (
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--accent-blue)" }}>
                {avgStress}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/10</span>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>rata-rata</p>
            </div>
          )}
        </div>

        {/* SVG Chart */}
        {stressLevels.length > 0 ? (
          <div>
            <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`} style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area */}
              {areaPath && (
                <path d={areaPath} fill="url(#stressGrad)" />
              )}
              {/* Line */}
              {svgPath && (
                <path
                  d={svgPath}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* Dots */}
              {stressPoints.map((p, i) =>
                p.y !== null ? (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y!}
                    r="4"
                    fill="white"
                    stroke="#0ea5e9"
                    strokeWidth="2.5"
                  />
                ) : null
              )}
              {/* X labels */}
              {stressLevels.map((s, i) => (
                <text
                  key={i}
                  x={(i / (stressLevels.length - 1 || 1)) * chartWidth}
                  y={chartHeight + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {s.day.slice(0, 3)}
                </text>
              ))}
            </svg>
          </div>
        ) : (
          <div style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Belum ada data stres minggu ini
            </p>
          </div>
        )}
      </div>

      {/* Recent Journals */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
            Jurnal Terbaru
          </h2>
          <Link
            href="/history"
            style={{
              fontSize: "13px",
              color: "var(--accent-blue)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Lihat Semua →
          </Link>
        </div>

        {journals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📔</div>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "16px" }}>
              Belum ada jurnal. Mulai ceritakan harimu!
            </p>
            <Link
              href="/journal/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "var(--accent-blue)",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Tulis Jurnal Pertama
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {journals.slice(0, 4).map((j) => (
              <Link
                key={j.id}
                href={`/journal/${j.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-light)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {j.title}
                    </p>
                    <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {j.content.slice(0, 100)}...
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {new Date(j.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                    {j.emotion && (
                      <span
                        style={{
                          background: "var(--accent-blue-light)",
                          color: "var(--accent-blue)",
                          padding: "2px 8px",
                          borderRadius: "99px",
                          fontSize: "11px",
                          fontWeight: 500,
                          textTransform: "capitalize",
                        }}
                      >
                        {j.emotion}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function emotionEmoji(emotion: string) {
  const map: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    anxious: "😰",
    angry: "😠",
    calm: "😌",
    stressed: "😤",
    excited: "🤩",
    neutral: "😐",
    fear: "😨",
    love: "🥰",
  };
  return map[emotion?.toLowerCase()] || "💭";
}
