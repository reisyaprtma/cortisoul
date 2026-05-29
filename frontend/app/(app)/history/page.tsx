"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { journalsApi, type Journal } from "@/lib/api";

export default function HistoryPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEmotion, setFilterEmotion] = useState("all");

  const loadJournals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await journalsApi.getAll();
      setJournals(res.data?.journals || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const uniqueEmotions = Array.from(
    new Set(journals.map((j) => j.emotion).filter(Boolean))
  ) as string[];

  const filtered = journals.filter((j) => {
    const matchSearch =
      search === "" ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.content.toLowerCase().includes(search.toLowerCase());
    const matchEmotion = filterEmotion === "all" || j.emotion === filterEmotion;
    return matchSearch && matchEmotion;
  });

  // Group by month
  const grouped = filtered.reduce<Record<string, Journal[]>>((acc, j) => {
    const key = new Date(j.created_at).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(j);
    return acc;
  }, {});

  const stressColor = (score?: number | null) => {
    if (!score && score !== 0) return "#64748b";
    if (score <= 3) return "#22c55e";
    if (score <= 6) return "#f97316";
    return "#ef4444";
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: "800px" }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
            Riwayat Jurnal 📚
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {journals.length} jurnal tersimpan
          </p>
        </div>
        <Link
          href="/journal/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tulis Jurnal
        </Link>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "16px",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jurnal..."
            style={{ paddingLeft: "36px" }}
          />
        </div>

        {/* Emotion filter */}
        <select
          value={filterEmotion}
          onChange={(e) => setFilterEmotion(e.target.value)}
          style={{ width: "auto", minWidth: "140px" }}
        >
          <option value="all">Semua Emosi</option>
          {uniqueEmotions.map((e) => (
            <option key={e} value={e} style={{ textTransform: "capitalize" }}>
              {emotionEmoji(e)} {e}
            </option>
          ))}
        </select>
      </div>

      {/* Journal List */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: "90px",
                background: "#fff",
                borderRadius: "14px",
              }}
              className="animate-pulse-soft"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
            {journals.length === 0 ? "Belum Ada Jurnal" : "Tidak Ada Hasil"}
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
            {journals.length === 0
              ? "Mulai perjalanan jurnalmu sekarang!"
              : "Coba ubah kata kunci atau filter pencarian"}
          </p>
          {journals.length === 0 && (
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
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {Object.entries(grouped).map(([month, monthJournals]) => (
            <div key={month}>
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "10px",
                }}
              >
                {month}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {monthJournals.map((j) => (
                  <Link key={j.id} href={`/journal/${j.id}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: "14px",
                        padding: "16px 18px",
                        border: "1px solid var(--border-light)",
                        boxShadow: "var(--shadow-sm)",
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--accent-blue)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-light)";
                        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                      }}
                    >
                      {/* Date badge */}
                      <div
                        style={{
                          flexShrink: 0,
                          width: "44px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-blue)", lineHeight: 1 }}>
                          {new Date(j.created_at).getDate()}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                          {new Date(j.created_at).toLocaleDateString("id-ID", { weekday: "short" })}
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ width: "1px", background: "var(--border-light)", alignSelf: "stretch" }} />

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {j.title}
                          </h3>
                          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                            {j.emotion && (
                              <span
                                style={{
                                  background: "var(--accent-blue-light)",
                                  color: "var(--accent-blue)",
                                  padding: "2px 8px",
                                  borderRadius: "99px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {emotionEmoji(j.emotion)} {j.emotion}
                              </span>
                            )}
                            {j.stress_score !== null && j.stress_score !== undefined && (
                              <span
                                style={{
                                  background: `${stressColor(j.stress_score)}15`,
                                  color: stressColor(j.stress_score),
                                  padding: "2px 8px",
                                  borderRadius: "99px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {j.stress_score}/10
                              </span>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {j.content.slice(0, 120)}
                          {j.content.length > 120 ? "..." : ""}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div style={{ flexShrink: 0, color: "var(--text-muted)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
