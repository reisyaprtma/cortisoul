"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { journalsApi, type Journal } from "@/lib/api";

export default function HistoryPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEmotion, setFilterEmotion] = useState("all");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("registered") === "success") {
        setShowSuccessAlert(true);
        // Hapus query parameter dari URL agar history tetap bersih
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  const loadJournals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await journalsApi.getAll();
      const all = res.data?.journals || [];
      const sorted = [...all].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setJournals(sorted);
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

  // Stress score: skala raw 0–1 dari ML model, tampil ×10
  const stressColor = (score?: number | null) => {
    if (score == null) return "#64748b";
    if (score < 4) return "#22c55e";
    if (score < 7) return "#f97316";
    return "#ef4444";
  };

  const displayStress = (score: number) => (score);
  console.log(journals);

  const getStressLabel = (score: number | null | undefined) => {
    if (score == null) return "-";
    if (score < 4) return "Rendah";
    if (score < 7) return "Sedang";
    return "Tinggi";
  };

  return (
    <div className="app-page animate-fadeIn">
      {/* Header */}
      <div className="page-header-row" style={{ marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
            Riwayat Jurnal
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {journals.length} jurnal tersimpan
          </p>
        </div>
        <Link
          href="/journal/new"
          className="btn-primary-inline"
          style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginTop:10,
                flexShrink: 0,
                background: "#3d5a5a",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textDecoration: "none",
                textTransform: "uppercase",
                boxShadow: "0 4px 12px rgba(61, 90, 90, 0.28)",
                whiteSpace: "nowrap",
              }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tulis Jurnal
        </Link>
      </div>

      {showSuccessAlert && (
        <div
          style={{
            background: "rgba(34, 197, 94, 0.08)",
            border: "1.5px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "16px",
            padding: "14px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            animation: "fadeIn 0.25s ease-out forwards",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "rgba(34, 197, 94, 0.2)",
              color: "#22c55e",
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                Pendaftaran Berhasil!
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Selamat datang di CortiSoul. Akun Anda berhasil terdaftar dan Anda kini telah masuk.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessAlert(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 4px 24px rgba(61, 90, 90, 0.08)",
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
          style={{ width: "auto", minWidth: "140px", flex: "1 1 140px" }}
        >
          <option value="all">Semua Emosi</option>
          {uniqueEmotions.map((e) => (
            <option key={e} value={e} style={{ textTransform: "capitalize" }}>
              {e.charAt(0).toUpperCase() + e.slice(1)}
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
                background: "var(--bg-card)",
                borderRadius: "16px",
                boxShadow: "0 4px 24px rgba(61, 90, 90, 0.08)",
              }}
              className="animate-pulse-soft"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          {/* <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div> */}
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
                gap: "8px",
                marginTop:10,
                flexShrink: 0,
                background: "#3d5a5a",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textDecoration: "none",
                textTransform: "uppercase",
                boxShadow: "0 4px 12px rgba(61, 90, 90, 0.28)",
                whiteSpace: "nowrap",
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
                      className="history-journal-card"
                      style={{
                        background: "var(--bg-card)",
                        borderRadius: "16px",
                        padding: "16px 18px",
                        boxShadow: "0 4px 24px rgba(61, 90, 90, 0.08)",
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 8px 30px rgba(61, 90, 90, 0.15)";
                        e.currentTarget.style.background = "var(--bg-card-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 24px rgba(61, 90, 90, 0.08)";
                        e.currentTarget.style.background = "var(--bg-card)";
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
                        <div className="history-journal-title-row">
                          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {j.title}
                          </h3>
                          <div className="history-journal-badges">
                            {j.emotion && (
                              <span
                                style={{
                                  background: `${j.emotion ? "rgba(20,184,166,0.12)" : ""}`,
                                color: "var(--teal-badge)",
                                padding: "2px 8px",
                                borderRadius: "99px",
                                fontSize: "11px",
                                fontWeight: 600,
                                textTransform: "capitalize",
                                whiteSpace: "nowrap",
                                }}
                              >
                                {j.emotion.charAt(0).toUpperCase() + j.emotion.slice(1)}
                              </span>
                            )}
                            {j.stress_score != null && (
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
                                Stres {getStressLabel(j.stress_score)}
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
                      <div className="history-journal-arrow" style={{ flexShrink: 0, color: "var(--text-muted)" }}>
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


